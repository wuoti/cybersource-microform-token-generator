import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Flex: any
  }
}

export type CreateTokenOptions = {
  expirationMonth: string
  expirationYear: string
}

type MicroformField = {
  load: (selector: string) => void
}

type UseMicroformParams = {
  creditCardNumberContainerId: string
  securityCodeContainerId: string
  sessionId: string
}

export type MicroformInstance = {
  createField: (fieldName: string) => MicroformField
  createToken: (options: CreateTokenOptions, cb: (err: Error, response: string) => void) => void
}

const getCreditCardToken = (
  microformInstance: MicroformInstance | undefined,
  options: CreateTokenOptions
): Promise<string> =>
  new Promise((resolve, reject) => {
    microformInstance?.createToken(options, (err, response) => {
      if (err) {
        return reject(err)
      }
      return resolve(response)
    })
  })

const useMicroform = ({
  sessionId,
  creditCardNumberContainerId,
  securityCodeContainerId,
}: UseMicroformParams) => {
  const microformInstanceRef = useRef<MicroformInstance>()

  useEffect(() => {
    if (!microformInstanceRef.current) {
      const flex = new window.Flex(sessionId)
      const microform: MicroformInstance = flex.microform({
        styles: {},
      })

      const number = microform.createField('number')
      const securityCode = microform.createField('securityCode')

      number.load(`#${creditCardNumberContainerId}`)
      securityCode.load(`#${securityCodeContainerId}`)

      microformInstanceRef.current = microform
    }
  }, [sessionId, securityCodeContainerId, creditCardNumberContainerId])

  return {
    getToken: (options: CreateTokenOptions) =>
      getCreditCardToken(microformInstanceRef.current, options),
  }
}

export default useMicroform
