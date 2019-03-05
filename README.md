# HTML transformer

This is work in progress.

This Node script opens an HTML file in Puppeteer, transforms it, and saves the transformed HTML file.


## Usage

1. Install dependendies:

   - install node modules by running `npm install` in this folder
   - install Puppeteer by running `npm install puppeteer`.

2. Follow the instructions below for transforming an online page or a local one.

### Transforming a page online

Run:

```shell
node transform.js --url http://full/url/of/mypage.html --action myaction
```

The transformed file will be saved as `_output/transformed.html`.


### Transforming a local file

1. Save the HTML file you want to transform to this folder.
2. Serve this folder at `http://127.0.0.1:8080` (e.g. with Node's [http-server](https://www.npmjs.com/package/http-server)). This is necessary because Puppeteer needs to access the file over HTTP.
3. Run this script with:

    ```shell
    node transform.js --url mypage.html --action myaction
    ```

The transformed file will be saved to `_output/transformed.html`.


## Actions

To create further actions, follow the `cleanMathJax` or `nerdc` example in `transform.js`:

- write new functions at `// Page functions available`, and 
- run them in response to command-line actions at `// Run page functions`.
