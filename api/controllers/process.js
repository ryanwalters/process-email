'use strict';

const Boom = require('boom');
const MailParser = require('mailparser').MailParser;
const Request = require('request');
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

                console.log(payload);

                break;

            default:
                return reply(Boom.badRequest());
        }

        /*const parser = new MailParser();

        parser.on('end', (mail) => {

            console.log(typeof mail);

            return reply('ok');
        });

        parser.write('Return-Path: <braveknave@gmail.com>\r\nReceived: from mail-io0-f169.google.com (mail-io0-f169.google.com [209.85.223.169])\r\n by inbound-smtp.us-east-1.amazonaws.com with SMTP id 89alifm95ee56gqa29lckk18cq3uur59tujja2o1\r\n for admin@visionsofthefuture.io;\r\n Tue, 12 Apr 2016 19:59:06 +0000 (UTC)\r\nX-SES-Spam-Verdict: PASS\r\nX-SES-Virus-Verdict: PASS\r\nReceived-SPF: pass (spfCheck: domain of _spf.google.com designates 209.85.223.169 as permitted sender) client-ip=209.85.223.169; envelope-from=braveknave@gmail.com; helo=mail-io0-f169.google.com;\r\nAuthentication-Results: amazonses.com;\r\n spf=pass (spfCheck: domain of _spf.google.com designates 209.85.223.169 as permitted sender) client-ip=209.85.223.169; envelope-from=braveknave@gmail.com; helo=mail-io0-f169.google.com;\r\n dkim=pass header.i=@gmail.com;\r\nReceived: by mail-io0-f169.google.com with SMTP id g185so42906787ioa.2\r\n        for <admin@visionsofthefuture.io>; Tue, 12 Apr 2016 12:59:06 -0700 (PDT)\r\nDKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;\r\n        d=gmail.com; s=20120113;\r\n        h=mime-version:from:date:message-id:subject:to;\r\n        bh=b1jAZAEjg+KjfhMIqIGFzJnBjJ+Ef7CA+9b2HqAb+lM=;\r\n        b=tznVi8GGb1j6oRUjhyN+RyIJui8LfyPjG2EOPOZroO/DWWhs/teacsxhW5kaZWFe1D\r\n         l82OwqIEsKyXF7y2UGPM438z3+bBzK9/528S2yxa2xTz72r7CosWPVHdLWRHLkSKyDnX\r\n         RMF9FV0kiqJvoOLa/t7qUPSdAeKVeUu+FY6aV/Jgh7Xpag4R4R5AQ5hASJAkHnr/r17V\r\n         CPbr8wOPTg6magRNmr/ZxHjuwpjO2tOuolu4fZvLSsTzRWjAJ7WVMIIrgRCt0AMs13i7\r\n         7D/FFfTe98jV4knM5/FFTifYnhrNDzW0SdXNZFhScsdNWuHp02jjQEb4Wr1gmVh9l+oE\r\n         syzA==\r\nX-Google-DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;\r\n        d=1e100.net; s=20130820;\r\n        h=x-gm-message-state:mime-version:from:date:message-id:subject:to;\r\n        bh=b1jAZAEjg+KjfhMIqIGFzJnBjJ+Ef7CA+9b2HqAb+lM=;\r\n        b=AuMPRng5DsnrX8Ipt29cunpQtjye6/CqkxxZrXCkVFdrE6znUk9C4FDxPyxv7BYlLK\r\n         oylCmVbLg/oT7P0cKThLjS8VMXFIVsn9BePfXbstg6Su80ZaWgm4xN3O5T1a16tn2jaA\r\n         TXugwykmulJEtPQewObbCraUnuxNPUPjbU/ixdS7TWInIc68fmbOXJmLJ8LXdyJ23rpA\r\n         YpMtVEx1erDbY/uihT2ogd8pF4GUfkfWIKq2nHZfQEFofTMNFsm4h8wSguRuvs91at24\r\n         DEViz5J7ykCZOsBiUvKdJGdRUjfLDGOj2/o2zdkfjFiJ6FBVR4YO1biFenZFMYt5ylvG\r\n         QLoQ==\r\nX-Gm-Message-State: AOPr4FV9r4N8UBboWxAbu6El/vMs391V70DD1VXbTIAnG2Qcj453+iPG14kqTggnOkjubgFEGPkwinXiItfkDw==\r\nX-Received: by 10.107.26.203 with SMTP id a194mr6844601ioa.115.1460491146115;\r\n Tue, 12 Apr 2016 12:59:06 -0700 (PDT)\r\nMIME-Version: 1.0\r\nFrom: Ryan Walters <braveknave@gmail.com>\r\nDate: Tue, 12 Apr 2016 19:58:56 +0000\r\nMessage-ID: <CAGMaVb-btWZBdGUhfWqi+O4STBksAuc4kx0n764GH0gNx4_WPQ@mail.gmail.com>\r\nSubject: test\r\nTo: braveknave <admin@visionsofthefuture.io>\r\nContent-Type: multipart/alternative; boundary=001a113fd448f6411d05304f17e5\r\n\r\n--001a113fd448f6411d05304f17e5\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\nheres some text.\r\n\r\na little formatting.\r\n\r\n*more formatting required*\r\n\r\n--001a113fd448f6411d05304f17e5\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n<div dir=\"ltr\">heres some text.<div><br></div><div>a little formatting.</div><div><br></div><div><b>more <i>formatting <u>required</u></i></b></div></div>\r\n\r\n--001a113fd448f6411d05304f17e5--\r\n');
        parser.end();*/
    }
};