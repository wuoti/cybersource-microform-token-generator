import {
  Alert,
  AlertIcon,
  Box,
  Button,
  chakra,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Text,
} from '@chakra-ui/react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Script from 'next/script'
import { FormEventHandler, useState } from 'react'
import { getCybersourceSession } from '../cybersource/session'
import useMicroform from '../hooks/useMicroform'

type Props = {
  sessionId: string
}

const months = Array.from({ length: 12 }).map((_, i) => `${i + 1}`.padStart(2, '0'))
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 21 }).map((_, i) => `${i + currentYear}`)

export default function TokenGenerator({ sessionId }: Props) {
  const [token, setToken] = useState<string>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<any>()

  const creditCardNumberContainerId = 'credit-card-number'
  const securityCodeContainerId = 'security-code'

  const { getToken } = useMicroform({
    sessionId,
    creditCardNumberContainerId,
    securityCodeContainerId,
  })

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const expirationMonth = e.target['expirationMonth'].value
    const expirationYear = e.target['expirationYear'].value

    try {
      const token = await getToken({ expirationMonth, expirationYear })

      setError(undefined)
      setToken(token)
    } catch (error) {
      setToken(undefined)
      setError(error.message ? error.message : error)
    }
  }

  return (
    <>
      <Script
        strategy="beforeInteractive"
        src="https://flex.cybersource.com/microform/bundle/v2/flex-microform.min.js"
      />
      <Box as="main">
        <Head>
          <title>Cybersource token generator</title>
        </Head>
        <Container maxW="lg" pt={10}>
          <Heading as="h1" size="lg">
            Cybersource token generator
          </Heading>
          <chakra.form onSubmit={onSubmit} mb={6}>
            <Stack spacing={5} pt={6}>
              <FormControl>
                <FormLabel>Credit card number</FormLabel>
                <Input as={Box} id={creditCardNumberContainerId} />
              </FormControl>
              <FormControl>
                <FormLabel>Security code</FormLabel>
                <Input as={Box} id={securityCodeContainerId} />
              </FormControl>
              <FormControl>
                <FormLabel>Expiration month</FormLabel>
                <Select name="expirationMonth">
                  {months.map((month) => (
                    <option key={month}>{month}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Expiration year</FormLabel>
                <Select name="expirationYear">
                  {years.map((year) => (
                    <option key={year}>{year}</option>
                  ))}
                </Select>
              </FormControl>
              <Button type="submit">Submit</Button>
            </Stack>
          </chakra.form>
          {token && (
            <Alert status="success">
              <AlertIcon />
              <Text overflowWrap="anywhere">{token}</Text>
            </Alert>
          )}
          {error && (
            <Alert status="error">
              <AlertIcon />
              <Text overflowWrap="anywhere">{error}</Text>
            </Alert>
          )}
        </Container>
      </Box>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const targetOrigin = process.env.TARGET_ORIGIN
  const runEnvironment = process.env.RUN_ENVIRONMENT
  const merchantId = process.env.MERCHANT_ID
  const merchantKeyId = process.env.MERCHANT_KEY_ID
  const merchantSecretKey = process.env.MERCHANT_SECRET_KEY

  const sessionId = await getCybersourceSession({
    merchantId,
    merchantKeyId,
    merchantSecretKey,
    runEnvironment,
    targetOrigin,
  })

  return {
    props: {
      sessionId,
    },
  }
}
