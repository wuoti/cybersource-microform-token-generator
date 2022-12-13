# What is it?

A simple application to generate credit card tokens using Cybersource Flex microform v2.

# How to run it?

You will need node and yarn installed.

Also, you will need a set of environment variables. Copy `.env.example` to `.env` and fill in the values for each of the environment variables.

```
cp .env.example .env
```

Then, install dependencies:

```
yarn install
```

Run the application:

```
yarn dev
```

Finally, open http://localhost:3000 in your browser and start generating some tokens!
