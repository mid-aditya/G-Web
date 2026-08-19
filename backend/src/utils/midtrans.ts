import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { snap } from '../config/midtrans.js'

interface MidtransItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CreateTransactionParams {
  orderId: string
  items: MidtransItem[]
  customerDetails: {
    firstName: string
    email: string
    phone?: string
  }
}

export const createMidtransTransaction = async (params: CreateTransactionParams) => {
  const transactionId = `SETSUKO-${params.orderId}-${uuidv4().slice(0, 8)}`

  const transaction = await snap.createTransaction({
    transaction_details: {
      order_id: transactionId,
      gross_amount: params.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    },
    item_details: params.items,
    customer_details: params.customerDetails,
    enabled_payments: [
      'credit_card',
      'bca_va',
      'bni_va',
      'bri_va',
      'mandiri_va',
      'gopay',
      'shopeepay',
      'dana',
      'indomaret',
      'alfamart',
    ],
    expiry: {
      unit: 'hour',
      duration: 24,
    },
    callbacks: {
      finish: `${process.env.CORS_ORIGIN}/orders/${params.orderId}`,
    },
  })

  return {
    token: transaction.token,
    redirectUrl: transaction.redirect_url,
    transactionId,
  }
}

export const verifyMidtransNotification = (body: Record<string, unknown>) => {
  const signatureKey = body.signature_key as string
  const orderId = body.order_id as string
  const statusCode = body.status_code as string
  const grossAmount = body.gross_amount as string

  const dataToSign = `${orderId}${statusCode}${grossAmount}${process.env.MIDTRANS_SERVER_KEY}`
  const expectedSignature = crypto
    .createHash('sha512')
    .update(dataToSign)
    .digest('hex')

  return signatureKey === expectedSignature
}
