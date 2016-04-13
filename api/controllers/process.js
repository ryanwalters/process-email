'use strict';

const AWS = require('aws-sdk');
const Boom = require('boom');
const Charset = require('../constants').Charset;
const MailParser = require('mailparser').MailParser;
const Request = require('request');
const Status = require('../constants').Status;
const Xml2js = require('xml2js');


// Set AWS defaults

AWS.config.region = process.env.AWS_DEFAULT_REGION;


// User endpoints

module.exports = {

    handler: (request, reply) => {

        const payload = JSON.parse(request.payload);


        // Check the AWS SNS message type

        switch (request.headers['x-amz-sns-message-type']) {

            case 'SubscriptionConfirmation':


                // Confirm the ARN is valid before subscribing

                if (process.env.AMAZON_TOPIC_ARNS && process.env.AMAZON_TOPIC_ARNS.indexOf(payload.TopicArn) === -1) {
                    return reply(Boom.badRequest('Invalid TopicArn'));
                }


                // ARN is valid, subscribe

                Request(payload.SubscribeURL, (error, response, body) => {

                    if (!error && response.statusCode === 200) {
                        Xml2js.parseString(body, (err, result) =>
                            console.log(`Successfully subscribed to: ${result.ConfirmSubscriptionResult.SubscriptionArn}`));
                    }
                });

                break;

            case 'Notification':

                const message = JSON.parse(payload.Message);


                // Make sure the email is safe

                if (message.receipt.spamVerdict.status !== Status.PASS ||
                    message.receipt.virusVerdict.status !== Status.PASS ||
                    message.receipt.spfVerdict.status !== Status.PASS ||
                    message.receipt.dkimVerdict.status !== Status.PASS) {
                    return console.log('Ignoring spam');
                }


                // Parse the content delivered by SNS

                const parser = new MailParser();

                parser.on('end', (email) => {

                    const ses = new AWS.SES();


                    // Send the email

                    ses.sendEmail({
                        Destination: {
                            ToAddresses: process.env.FORWARD_TO.split(' ')
                        },
                        Message: {
                            Body: {
                                Html: {
                                    Data: `To: ${message.destination.join(', ')}<hr />${email.html}`,
                                    Charset: Charset.UTF_8
                                },
                                Text: {
                                    Data: `To: ${message.destination.join(', ')} --- ${email.text}`,
                                    Charset: Charset.UTF_8
                                }
                            },
                            Subject: {
                                Data: email.subject,
                                Charset: Charset.UTF_8
                            }
                        },
                        Source: `${email.from[0]} <${process.env.SOURCE_EMAIL}>`,
                        ReplyToAddresses: email.from.map((person) => `${person.name} <${person.address}>`)
                    }, (err, data) => {

                        if (err) {
                            return console.log(err, err.stack);
                        }

                        console.log('Email successfully sent', data);
                    })
                });

                parser.write(message.content);
                parser.end();

                break;

            default:
                return reply(Boom.badRequest());
        }

        return reply('ok');
    }
};