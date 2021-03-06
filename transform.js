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

// For slugifying strings, like URLs into file names
// Credit: https://medium.com/@mhagemann/the-ultimate-way-to-slugify-a-url-string-in-javascript-b8e4a0d849e1
function slugify(string) {
    'use strict';

    const a = 'àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœṕŕßśșțùúüûǘẃẍÿź·/_,:;';
    const b = 'aaaaaaaaceeeeghiiiimnnnoooooprssstuuuuuwxyz------';
    const p = new RegExp(a.split('').join('|'), 'g');

    return string.toString().toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
        .replace(/&/g, '-and-') // Replace & with ‘and’
        .replace(/[^\w\-]+/g, '') // Remove all non-word characters
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, '') // Trim - from end of text
}

// The main file-processing function
async function run(action) {
    'use strict';

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Log console messages to Node console
    page.on('console', msg => console.log('Page console says:', msg.text()));

    // Go to the URL in Chrome
    await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 3000000 });

    // Confirm URL and action
    console.log('Transforming ' + url + ' with ' + action + ' ...');

    // Process the page
    var transformedHTML = await page.evaluate((action) => {

        // Page functions available
        // ------------------------

        // Insert full path to images
        async function insertFullImagePath(imageSelector) {
            'use strict';
            var url = window.location.href;
            if (url.includes('.html')) {
                var url = url.substring(0, url.lastIndexOf("/"));
            }
            var images = document.querySelectorAll(imageSelector);
            var i, currentImagePath, fullImagePath;
            for (i = 0; i < images.length; i += 1) {
                currentImagePath = images[i].getAttribute('src');
                fullImagePath = url + '/' + currentImagePath;
                images[i].setAttribute('src', fullImagePath);
            }
        }
        // Remove nodes
        async function removeNodes(selectors) {
            'use strict';
            var nodes = document.querySelectorAll(selectors);
            var i;
            for (i = 0; i < nodes.length; i += 1) {
                console.log('Removing ' + nodes[i]);
                nodes[i].remove();
            }
        }
        // Extract a child node, insert it after its parent,
        // and delete the parent
        async function extractNodes(keepSelectors, deleteSelectors) {
            'use strict';
            var deleteNodes = document.querySelectorAll(deleteSelectors);
            var i;
            for (i = 0; i < deleteNodes.length; i += 1) {
                var keepNodes = deleteNodes[i].querySelectorAll(keepSelectors);
                var j;
                for (j = 0; j < keepNodes.length; j += 1) {
                    deleteNodes[i].insertAdjacentElement('afterEnd', keepNodes[j]);
                }
                deleteNodes[i].remove();
            }
        }
        // Add a class to nodes
        async function addClassToNodes(selectors, classToAdd) {
            'use strict';
            var nodesToClassify = document.querySelectorAll(selectors);
            var i;
            for (i = 0; i < nodesToClassify.length; i += 1) {
                nodesToClassify[i].classList.add(classToAdd);
            }
        }

        // Run page functions from action commands
        // ---------------------------------------

        if (action === 'cleanMathJax') {
            removeNodes('.MathJax_Preview, .MathJax_CHTML');
        }
        if (action === 'nerdc') {
            // removeNodes('head, header, nav, .MathJax_Preview, .MathJax_CHTML');
            removeNodes('head, header, nav, footer, #MathJax_Message, .response-query-body, .how_to_write, [name="next-response"]');
            // addMathDelimiters('script[type="math/tex"]');
            extractNodes('.MJX_Assistive_MathML', '.latex-math');
            addClassToNodes('[class^=id]', 'highlighter');
            insertFullImagePath('img');
        }
        if (action === 'stripheads') {
            removeNodes('head, header, nav');
        }

        // Return the page
        return new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML;
    }, action);

    // Close the browser
    await browser.close();

    // Write the output file
    var shortFilename = url.split(/(\\|\/)/g).pop() + '_transformed.html';
    var longFilename = slugify(url) + '_transformed.html';
    fs.writeFile('_output/' + longFilename, transformedHTML, function(err) {
        if (err) {
            console.log('Sorry, got an error: ' + err);
        } else {
            console.log('New file saved.');
        }
    });
}

// Go!
run(action);
