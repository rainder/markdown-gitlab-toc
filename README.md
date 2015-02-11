## Usage

```sh
$ bin/markdown-gitlab-toc.js --help

  Usage: markdown-gitlab-toc [options]

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -o, --output <path>   Output to a file
    -x, --exclude <path>  Exclude matched paths
```

```sh
$ markdown-gitlab-toc -o ./TOC.md -x "node_modules|TOC.md|js/components" .
```

