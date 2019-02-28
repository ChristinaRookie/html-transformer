// Node package dependencies
const
    puppeteer = require('puppeteer'),
    args = require('yargs').argv,
    fs = require('fs');

// Get the page we're processing from command-line arguments
var url = 'index.html';
if (args.url && args.url.trim !== '') {
    // If this is a local file, prepend protocol
    if (args.url.indexOf("http") === -1) {
        url = 'http://127.0.0.1:8080/' + args.url;
    } else {
        url = args.url;
    }
}

// Get the action we're applying from command-line arguments
var action = '';
if (args.action && args.action.trim !== '') {
    action = args.action;
}

// The main file-processing function
async function run(action) {
    'use strict';

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Log console messages to Node console
    page.on('console', msg => console.log('Page console says:', msg.text()));

    await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 3000000 });

    // Confirm URL and action
    console.log('Transforming ' + url + ' with ' + action + ' ...');

    // Process the page
    var transformed = await page.evaluate((action) => {

        // Page functions available
        async function removeNodes(selectors) {
            'use strict';
            var nodes = document.querySelectorAll(selectors);
            var i;
            for (i = 0; i < nodes.length; i += 1) {
                console.log('Removing ' + nodes[i]);
                nodes[i].remove();
            }
        }

        // Run page functions
        if (action === 'cleanMathJax') {
            removeNodes('.MathJax_Preview, .MathJax_CHTML');
        }
        if (action === 'nerdc') {
            removeNodes('head, header, nav, .MathJax_Preview, .MathJax_CHTML');
        }

        // Return the page
        return new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML;
    }, action);

    // Close the browser
    await browser.close();

    // Write the output file
    fs.writeFile('_output/transformed.html', transformed, function(err) {  
        if (err) {
            console.log('Sorry, got an error: ' + err);
        } else {
            console.log('New file saved.');
        }
    });
}

// Go!
run(action);
