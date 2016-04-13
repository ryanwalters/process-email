'use strict';

const AWS = require('aws-sdk');
const Boom = require('boom');
const Charset = require('../constants').Charset;
const MailParser = require('mailparser').MailParser;
const Request = require('request');
const Status = require('../constants').Status;
const Xml2js = require('xml2js');


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
                const ses = new AWS.SES();

                /*ses.sendEmail({}, (err, data) => {

                });*/

                /*if (message.receipt.spamVerdict === Status.PASS &&
                    message.receipt.virusVerdict === Status.PASS &&
                    message.receipt.spfVerdict === Status.PASS &&
                    message.receipt.dkimVerdict === Status.PASS) {*/


                // Parse the content delivered by SNS

                const parser = new MailParser();

                parser.on('end', (email) => {


                    // Set the parameters for sending the email to the recipients

                    const sesParams = {
                        Destination: {
                            /*BccAddresses: [''],
                            CcAddresses: [''],*/
                            ToAddresses: email.to.map((value) => value.address)
                        },
                        Message: {
                            Body: {
                                Html: {
                                    Data: email.html,
                                    Charset: Charset.UTF_8
                                },
                                Text: {
                                    Data: email.text,
                                    Charset: Charset.UTF_8
                                }
                            },
                            Subject: {
                                Data: email.subject,
                                Charset: Charset.UTF_8
                            }
                        },
                        Source: process.env.SOURCE_EMAIL,

                        ReplyToAddresses: email.from.map((value) => value.address)/*,
                        ReturnPath: '',
                        ReturnPathArn: '',
                        SourceArn: ''*/
                    };


                    // Send the email

                    ses.sendEmail(sesParams, (err, data) => {

                        if (err) {
                            console.log(err, err.stack);
                        }

                        console.log('Email successfully sent.', data);
                    })
                });

                parser.write(message.content);
                parser.end();

                //}

                break;

            default:
                return reply(Boom.badRequest());
        }

        return reply('ok');
    }
};