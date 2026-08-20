declare module 'midtrans-client' {
  interface SnapOptions {
    isProduction: boolean
    serverKey: string
    clientKey: string
  }

  interface ApiOptions {
    isProduction: boolean
    serverKey: string
  }

  interface TransactionDetails {
    order_id: string
    gross_amount: number
  }

  interface ItemDetails {
    id: string
    name: string
    price: number
    quantity: number
  }

  interface CustomerDetails {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
  }

  interface Expiry {
    unit: string
    duration: number
  }

  interface Callbacks {
    finish?: string
    pending?: string
    error?: string
  }

  interface CreateTransactionParams {
    transaction_details: TransactionDetails
    item_details?: ItemDetails[]
    customer_details?: CustomerDetails
    enabled_payments?: string[]
    expiry?: Expiry
    callbacks?: Callbacks
    [key: string]: unknown
  }

  interface SnapResponse {
    token: string
    redirect_url: string
  }

  class Snap {
    constructor(options: SnapOptions)
    createTransaction(parameters: CreateTransactionParams): Promise<SnapResponse>
  }

  class CoreApi {
    constructor(options: ApiOptions)
    transaction: {
      status(orderId: string): Promise<any>
      statusNotification(orderId: string): Promise<any>
    }
  }
}
