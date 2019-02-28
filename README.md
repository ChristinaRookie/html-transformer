# HTML transformer

This is work in progress.

This Node script opens an HTML file in Puppeteer, transforms it, and saves the transformed HTML file.

## Usage

First, install the dependencies by running `npm install` in this folder.

### Transforming a local file

1. Save the HTML file you want to transform to this folder.
2. Serve this folder at `http://127.0.0.1:8080` (e.g. with Node's [http-server](https://www.npmjs.com/package/http-server)). This is necessary because Puppeteer needs to access the file over HTTP.
3. Run this script with:

    ```shell
    node transform.js --url mypage.html --action myaction
    ```

The transformed file will be saved to `_output/transformed.html`.

### Transforming a page online

Run

```shell
node transform.js --url http://full/url/of/mypage.html --action myaction
```

The transformed file will be saved as `_output/transformed.html`.

## Actions

Currently the only actions created are `cleanMathJax`, which removes `.MathJax_Preview` and `.MathJax_CHTML` nodes, and `nerdc`, which strips everything but the content of a particular kind of file we're testing with.

To create further actions, follow the `cleanMathJax` example there already:

- write them at `// Page functions available`, and 
- call them at `// Run page functions`, inside an if statement that checks whether than action was called from the command line.
