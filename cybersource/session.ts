import axios from 'axios'
import { createHash, createHmac } from 'crypto'

const generateDigest = (payload: string): string => {
  const buffer = Buffer.from(payload, 'utf8')
  const hash = createHash('sha256')
  hash.update(buffer)
  const digest = hash.digest('base64')
  return `SHA-256=${digest}`
}

type SessionParameters = {
  targetOrigin: string
  runEnvironment: string
  merchantId: string
  merchantSecretKey: string
  merchantKeyId: string
}

const getSignatureHeader = (
  resource: string,
  dateStr: string,
  payload: string,
  { merchantId, merchantKeyId, merchantSecretKey, runEnvironment }: SessionParameters
): string => {
  const signatureString = `host: ${runEnvironment}\ndate: ${dateStr}\n(request-target): post ${resource}\ndigest: ${generateDigest(
    payload
  )}\nv-c-merchant-id: ${merchantId}`

  const data = Buffer.from(signatureString, 'utf8')
  const key = Buffer.from(merchantSecretKey, 'base64')

  const signatureValue = createHmac('sha256', key).update(data).digest('base64')
  return `keyid="${merchantKeyId}", algorithm="HmacSHA256", headers="host date (request-target) digest v-c-merchant-id", signature="${signatureValue}"`
}

export const getCybersourceSession = async (params: SessionParameters): Promise<string> => {
  const { targetOrigin, merchantId, runEnvironment } = params
  const payload = {
    targetOrigins: [targetOrigin],
    // Narrow the list of allowed cards if necessary
    allowedCardNetworks: [
      'VISA',
      'MAESTRO',
      'MASTERCARD',
      'AMEX',
      'DISCOVER',
      'DINERSCLUB',
      'JCB',
      'CUP',
      'CARTESBANCAIRES',
      'CARNET',
    ],
    clientVersion: 'v2.0',
  }
  const dateStr = new Date(Date.now()).toUTCString()
  const stringPayload = JSON.stringify(payload)
  const resource = '/microform/v2/sessions'
  const response = await axios.post<string>(`https://${runEnvironment}${resource}`, stringPayload, {
    headers: {
      digest: generateDigest(stringPayload),
      'v-c-merchant-id': merchantId,
      date: `${dateStr}`,
      host: runEnvironment,
      signature: getSignatureHeader(resource, dateStr, stringPayload, params),
      'Content-Type': 'application/json',
    },
  })

  return response.data
}
