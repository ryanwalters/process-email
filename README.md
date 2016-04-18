# process-email

Simple email forwarder built on Amazon Web Services' Simple Notification Service (SNS) and Simple Email Service (SES).

## Setup

You will need to set up a few things within the AWS Dashboard:

1. In IAM:
 - Create a new user
 - Attach the `AmazonSESFullAccess` policy to the user
 - Download the credentials, you'll need these for creating environment variables

2. In SNS:
 - Create a new "Topic"
 - Within that Topic, create a new HTTP/HTTPS subscription pointing to where process-email is deployed. e.g. https://example.com/v1/process
 - Take note of the ARN, you will need this for an environment variable

3. In SES:
 - Under "Identity Management", follow the steps to "Verify a New Domain"
 - Under "Email Receiving", create a new rule set
 - Within that rule set, Create Rule using the email address(es) that you plan on receiving emails from
 (e.g. admin@example.com). Under Actions, choose SNS and choose the Topic you just created.

4. Back in the app, create the following environment variables:
 - `AWS_ACCESS_KEY_ID` taken from the downloaded IAM credentials
 - `AWS_SECRET_ACCESS_KEY` taken from the downloaded IAM credentials
 - `AWS_DEFAULT_REGION` the Amazon region you will be making calls from. e.g. `AWS_DEFAULT_REGION=us-east-1`
 - `AMAZON_TOPIC_ARNS` this is the SNS ARN you created earlier. Multiple ARNs should be separated with a space
 - `FORWARD_TO` email address(es) to forward the admin@example.com email to. Multiple emails should be separated with
  a space. e.g. `FORWARD_TO=johndoe@gmail.com otherguy@gmail.com`
 - `SOURCE_EMAIL` the email address from the verified domain that will send the forwarded email. e.g.
  `SOURCE_EMAIL=no-reply@example.com`

5. After your app is deployed and the environment variables are set up, go back to the SNS Topic, select your
subscription, and click the "Request Confirmations" button. This should make the POST to your deployed app and handle
the subscription. You can verify the subscription was successful by checking your app's logs.

That's it! Emails sent to the recipients in your SES rule set should now be forwarded on to your other email addresses.