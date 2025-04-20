import { BAD_REQUEST, SUCCESS } from "../../constants/statusCode.js";
import { messageHandler } from "../../utils/index.js";
import axios from 'axios';
import sequelize from "../../database/db.js";

class PaystackService {
    constructor() {
        if (!PaystackService.instance) {
            this.initialize();
            PaystackService.instance = this;
        }
        return PaystackService.instance;
    }

    initialize() {
        try {
            this.baseURL = process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';
            this.secretKey = process.env.PAYSTACK_SECRET_KEY;

            this.api = axios.create({
                baseURL: this.baseURL,
                timeout: 10000,
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    "Content-Type": "application/json"
                }
            });

            this.setupInterceptors();
            console.log('Paystack Service initialized successfully');
        } catch (error) {
            console.error('Paystack Service initialization error:', error);
            throw error;
        }
    }

    setupInterceptors() {
        this.api.interceptors.request.use(
            request => {
                console.log('Request:', {
                    method: request.method,
                    url: request.url,
                    headers: request.headers,
                    data: request.data
                });
                return request;
            },
            error => {
                console.error('Request Error:', error);
                return Promise.reject(error);
            }
        );

        this.api.interceptors.response.use(
            response => {
                console.log('Response:', response.data);
                return response;
            },
            error => {
                console.error('Error Response:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                return Promise.reject(error);
            }
        );
    }

    async initializeTransaction(data, callback) {
        try {
            // First create a transaction record
            const transaction = await Transaction.create({
                type: 'PAYMENT',
                initiatorType: data.initiatorType || 'CUSTOMER',
                initiatorId: data.initiatorId,
                recipientType: 'PLATFORM',
                recipientId: 'ADMIN',
                orderId: data.orderId, 
                amount: data.amount,
                provider: 'PAYSTACK',
                status: 'PENDING',

                providerReference: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                description: data.description || 'Payment initialization',
                metadata: {
                    ...data.metadata,
                    email: data.email
                }
            });
    
            const payload = {
                email: data.email,
                amount: data.amount * 100, 
                reference: transaction.providerReference,
                callback_url: data.callbackUrl || `${process.env.FRONTEND_URL}/payment/verify`,
                metadata: {
                    transaction_id: transaction.id,
                    order_id: data.orderId,
                    custom_fields: data.metadata || []
                }
            };
    
            const response = await this.api.post('/transaction/initialize', payload);
    
    
            return callback(messageHandler("Transaction initialized successfully", true, SUCCESS, {
                ...response.data.data,
                transaction_id: transaction.id
            }));
        } catch (error) {
            console.error("Error initializing transaction:", error.response?.data || error.message);
            return callback(messageHandler("Failed to initialize transaction", false, BAD_REQUEST));
        }
    }
    async verifyTransaction(reference, callback) {
        try {
            const response = await this.api.get(`/transaction/verify/${reference}`);
            const paymentData = response.data.data;
            
            const transaction = await Transaction.findOne({
                where: { providerReference: reference }
            });

            if (!transaction) {
                return callback(messageHandler("Transaction not found", false, BAD_REQUEST));
            }

            await sequelize.transaction(async (t) => {
                await transaction.update({
                    status: paymentData.status === 'success' ? 'SUCCESS' : 
                            paymentData.status === 'failed' ? 'FAILED' : 'PENDING',
                    paymentMethod: paymentData.channel,
                    paymentDate: new Date(),
                    metadata: {
                        ...transaction.metadata,
                        paystack: paymentData,
                        verificationResponse: paymentData,
                        cardType: paymentData.authorization?.card_type,
                        last4: paymentData.authorization?.last4,
                        bank: paymentData.authorization?.bank
                    }
                }, { transaction: t });

                if (paymentData.status === 'success' && transaction.orderId) {
                    await Order.update(
                        { paymentStatus: 'PAID' },
                        { 
                            where: { id: transaction.orderId },
                            transaction: t 
                        }
                    );
                }
            });

            return callback(messageHandler(
                "Payment verified successfully", 
                true, 
                SUCCESS, 
                {
                    status: transaction.status,
                    reference: transaction.providerReference,
                    orderId: transaction.orderId
                }
            ));
        } catch (error) {
            console.error("Error verifying transaction:", error);
            return callback(messageHandler("Failed to verify payment", false, BAD_REQUEST));
        }
    }

    async createTransferRecipient(data, callback) {
        try {
            const payload = {
                type: "nuban",
                name: data.accountName,
                account_number: data.accountNumber,
                bank_code: data.bankCode,
                currency: "NGN"
            };

            const response = await this.api.post('/transferrecipient', payload);
            return callback(messageHandler("Transfer recipient created successfully", true, SUCCESS, response.data.data));
        } catch (error) {
            console.error("Error creating transfer recipient:", error.response?.data || error.message);
            return callback(messageHandler("Failed to create transfer recipient", false, BAD_REQUEST));
        }
    }

    async initiateTransfer(data, callback) {
        try {
            const transaction = await Transaction.create({
                type: 'PAYOUT',
                initiatorType: 'ADMIN',
                initiatorId: data.adminId,
                recipientType: data.recipientType,
                recipientId: data.recipientId,
                amount: data.amount,
                provider: 'PAYSTACK',
                status: 'PENDING',
                providerReference: `TRF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                description: data.reason || 'Transfer payout',
                metadata: {
                    recipientCode: data.recipientCode
                }
            });

            const payload = {
                source: "balance",
                amount: data.amount * 100,
                recipient: data.recipientCode,
                reason: data.reason || transaction.providerReference
            };

            const response = await this.api.post('/transfer', payload);

            return callback(messageHandler("Transfer initiated successfully", true, SUCCESS, response.data.data));
        } catch (error) {
            console.error("Error initiating transfer:", error.response?.data || error.message);
            return callback(messageHandler("Failed to initiate transfer", false, BAD_REQUEST));
        }
    }

    async getBanksList(callback) {
        try {
            const response = await this.api.get('/bank');
            return callback(messageHandler("Banks list retrieved successfully", true, SUCCESS, response.data.data));
        } catch (error) {
            console.error("Error retrieving banks:", error.response?.data || error.message);
            return callback(messageHandler("Failed to retrieve banks", false, BAD_REQUEST));
        }
    }

    async verifyAccountNumber(data, callback) {
        try {
            const response = await this.api.get(
                `/bank/resolve?account_number=${data.accountNumber}&bank_code=${data.bankCode}`
            );
            return callback(messageHandler("Account verified successfully", true, SUCCESS, response.data.data));
        } catch (error) {
            console.error("Error verifying account:", error.response?.data || error.message);
            return callback(messageHandler("Failed to verify account", false, BAD_REQUEST));
        }
    }

    async getTransactionsList(filters, callback) {
        try {
            const response = await this.api.get('/merchant/transactions', {
                params: {
                    pageSize: filters.pageSize || 10,
                    pageNo: filters.pageNo || 1,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    paymentStatus: filters.paymentStatus
                }
            });
            return callback(messageHandler("Transactions list retrieved successfully", true, SUCCESS, response.data.data));
        } catch (error) {
            console.error("Error retrieving transactions:", error.response?.data || error.message);
            return callback(messageHandler("Failed to retrieve transactions", false, BAD_REQUEST));
        }
    }

    async handleWebhook(payload, callback) {
        try {
            const { event, data } = payload;
            
            switch (event) {
                case 'charge.success':
                    await this.handleSuccessfulPayment(data);
                    break;
                case 'charge.failed':
                    await this.handleFailedPayment(data);
                    break;
                default:
                    console.log('Unhandled webhook event:', event);
            }
            
            return callback(messageHandler("Webhook processed successfully", true, SUCCESS));
        } catch (error) {
            console.error("Webhook processing error:", error);
            return callback(messageHandler("Webhook processing failed", false, BAD_REQUEST));
        }
    }

    async handleSuccessfulPayment(data) {
        try {
            const transaction = await Transaction.findOne({
                where: { providerReference: data.reference }
            });
            
            if (!transaction) {
                console.error("Transaction not found for reference:", data.reference);
                return;
            }
            
            await sequelize.transaction(async (t) => {
                await transaction.update({
                    status: 'SUCCESS',
                    paymentMethod: data.channel,
                    paymentDate: new Date(),
                    metadata: {
                        ...transaction.metadata,
                        paystack: data,
                        paymentReference: data.reference,
                        cardType: data.authorization?.card_type,
                        last4: data.authorization?.last4,
                        bank: data.authorization?.bank
                    }
                }, { transaction: t });
                
                if (transaction.orderId) {
                    await Order.update(
                        { paymentStatus: 'PAID' },
                        { 
                            where: { id: transaction.orderId },
                            transaction: t 
                        }
                    );
                }
            });
        } catch (error) {
            console.error("Error handling successful payment:", error);
            throw error;
        }
    }

    async handleFailedPayment(data) {
        try {
            const transaction = await Transaction.findOne({
                where: { providerReference: data.reference }
            });
            
            if (!transaction) {
                console.error("Transaction not found for reference:", data.reference);
                return;
            }
            
            await transaction.update({
                status: 'FAILED',
                paymentMethod: data.channel,
                paymentDate: new Date(),
                metadata: {
                    ...transaction.metadata,
                    paystack: data,
                    failureReason: data.gateway_response,
                    paymentReference: data.reference
                }
            });
        } catch (error) {
            console.error("Error handling failed payment:", error);
            throw error;
        }
    }

    async handleSuccessfulTransfer(data) {
        const transaction = await Transaction.findOne({
            where: { providerReference: data.reference }
        });
        
        if (!transaction) return;
        
        await transaction.update({
            status: 'SUCCESS',
            paymentDate: new Date(),
            metadata: {
                ...transaction.metadata,
                paystack: data,
                transferCode: data.transfer_code,
                recipientCode: data.recipient.recipient_code
            }
        });
    }

    async handleFailedTransfer(data) {
        const transaction = await Transaction.findOne({
            where: { providerReference: data.reference }
        });
        
        if (!transaction) return;
        
        await transaction.update({
            status: 'FAILED',
            metadata: {
                ...transaction.metadata,
                paystack: data,
                failureReason: data.reason,
                transferCode: data.transfer_code
            }
        });
    }

    async handleReversedTransfer(data) {
        const transaction = await Transaction.findOne({
            where: { providerReference: data.reference }
        });
        
        if (!transaction) return;
        
        await transaction.update({
            status: 'CANCELLED',
            metadata: {
                ...transaction.metadata,
                paystack: data,
                reversalReason: data.reason,
                transferCode: data.transfer_code
            }
        });
    }

    async createDedicatedVirtualAccount(userData, callback) {
        try {
            // Determine the correct model based on user type
            const models = {
                supplier: Supplier,
                customer: Customer,
                rider: Rider
            };

            const UserModel = models[userData.userType];
            if (!UserModel) {
                return callback(messageHandler("Invalid user type", false, BAD_REQUEST));
            }

            let user = await UserModel.findByPk(userData.userId);
            if (!user) {
                return callback(messageHandler("User not found", false, BAD_REQUEST));
            }

            // Validate required fields
            if (!user.phoneNumber && !user.phone) {
                return callback(messageHandler("User phone number is required", false, BAD_REQUEST));
            }

            // Check/create Paystack customer code
            if (!user.paystackCustomerCode) {
                const customerResponse = await this.api.post('/customer', {
                    email: user.email,
                    first_name: user.firstName || user.firstname,
                    last_name: user.lastName || user.lastname,
                    phone: user.phoneNumber || user.phone
                });

                // Directly update and refresh user instance
                user = await UserModel.findByPk(userData.userId);
                user.paystackCustomerCode = customerResponse.data.data.customer_code;
                await user.save();
            }

            // Create dedicated virtual account
            const response = await this.api.post('/dedicated_account', {
                customer: user.paystackCustomerCode,
                preferred_bank: userData.preferredBank || "wema-bank",
                phone: user.phoneNumber || user.phone
            });

            const accountData = response.data.data;

            // Add null checks for bank data
            const [wallet] = await Wallet.findOrCreate({
                where: {
                    userType: userData.userType,
                    userId: userData.userId
                },
                defaults: {
                    paystackDedicatedAccountId: accountData.id,
                    accountNumber: accountData.account_number,
                    accountName: accountData.account_name,
                    bankName: accountData.bank?.name || 'Unknown Bank',
                    bankCode: accountData.bank?.id || '000',
                    currency: 'NGN',
                    balance: 0,
                    isActive: true
                }
            });

            return callback(messageHandler("Virtual account created", true, SUCCESS, {
                account_number: wallet.accountNumber,
                bank_name: wallet.bankName,
                account_name: wallet.accountName
            }));

        } catch (error) {
            console.error("DVA creation error:", error.response?.data || error.message);
            return callback(messageHandler("Failed to create virtual account", false, BAD_REQUEST));
        }
    }

    async getDedicatedAccounts(customerCode, callback) {
        try {
            const response = await this.api.get(`/dedicated_account?customer=${customerCode}`);
            return callback(messageHandler("Virtual accounts retrieved", true, SUCCESS, response.data.data));
        } catch (error) {
            console.error("Get DVA error:", error.response?.data || error.message);
            return callback(messageHandler("Failed to get accounts", false, BAD_REQUEST));
        }
    }

    async deactivateDedicatedAccount(accountId, callback) {
        try {
            const response = await this.api.delete(`/dedicated_account/${accountId}`);
            await Wallet.update(
                { isActive: false },
                { where: { paystackDedicatedAccountId: accountId } }
            );
            return callback(messageHandler("Account deactivated", true, SUCCESS, response.data.data));
        } catch (error) {
            console.error("Deactivation error:", error.response?.data || error.message);
            return callback(messageHandler("Failed to deactivate account", false, BAD_REQUEST));
        }
    }
}

// Create and export singleton instance
const paystackService = new PaystackService();
export default paystackService;