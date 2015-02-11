# [PROTOTYPE]

## Description

```sh
$ bin/markdown-gitlab-toc.js --help

  Usage: markdown-gitlab-toc [options] <paths ...>

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -o, --output <path>   Output to a file
    -x, --exclude <path>  Exclude matched paths
```

## Usage

```sh
$ markdown-gitlab-toc -o ./TOC.md -x "node_modules|TOC.md|js/components" .
```

## Output

```
# Table of Contents

* [README.md](README.md)
* src
        * [consumers](src/consumers/README.md)
        * [crons](src/crons/README.md)
        * [api](src/api/README.md)
```