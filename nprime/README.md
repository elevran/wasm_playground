# Find Nth prime

Sample programs for finding Nth prime number.

## Prerequisites

Install a WASM runtime, such as [wasmer](https://github.com/wasmerio/wasmer)

## Python

### Standalone

```sh
time python3 nprime.py 100000
The 100000th prime number is: 1299709

real    0m0.328s
user    0m0.258s
sys     0m0.032s
```

### Using py2wasm

By default [py2wasm](https://github.com/wasmerio/py2wasm) works on Python3 versions
 < 3.12 so it fails on Ubuntu 24.04 which comes with 3.12 by default.
 You can use [pyenv](https://github.com/pyenv/pyenv) to install 3.11 and set it
 as the default (globablly for the user or for the current shell only).
 [Nuitka](https://github.com/Nuitka/Nuitka), on which py2wasm is based already supports
 versions up to and including 3.13 so it's probably a matter of time before this is
 resolved.

```sh
py2wasm nprime.py -o nprime.py.wasm
time wasmer run nprime.py.wasm
The 100000th prime number is: 1299709

real    0m0.664s
user    0m0.580s
sys     0m0.058s
```

Running the Python code through py2wasm and then wasmer runtime is 2x slower than
 "native" python.

Other runtimes, such as [wasmtime](https://github.com/bytecodealliance/wasmtime),
 [wazero](https://github.com/tetratelabs/wazero/) and [wasmedge](https://wasmedge.org/) 
 show different runtime performance results on this benchmark (e.g., on my laptop 
 `wasmtime` was 0.78 sec; `wazero` had 2.65 sec for precompiled code and 4.85sec for 
 interpreted code; and `wasmedge` ran in 52s for interpreted or 1.3s for AOT compiled).

Using Extism in Go uses `wazero` as the WASM runtime. This is likely sufficient for 
 demonstration purposes (and ease of development due to Go familiarity). A Rust
 based Extism applicaiton would be preferred if runtime performance is critical, as
 that would use `wasmtime` (by defualt. There is also an open source
 [project](https://github.com/anlumo/webxtism/) that uses `wasmer` as the runtime
 instead of `wasmtime`).

### Other options considered

- [pyoxidizer](https://pyoxidizer.readthedocs.io/en/stable/pyoxidizer.html) -
 builds a rust application with embedded python interpreter. Rust can be compiled
 using WASM as a target. This approach is not mainstream and not pursued further.
- [pyiodide](https://pyodide.org/en/stable/index.html) - Pyodide is a Python 
 distribution for the browser and Node.js based on WebAssembly. This was not pursued
 since it offers an interpreter and would be (at least partly) covered in the JS 
 experiments below. The main advantage seems to be indsutrial use (e.g., by
 [Cloudflare](https://blog.cloudflare.com/python-workers/) and active porting
 of [common libraries](https://pyodide.org/en/stable/development/new-packages.html)
 to WASI so they can be used  from WASM).

## Javascript

### Standalone

```sh
time node nprime.js 100000
The 100000th prime number is: 1299709

real    0m0.226s
user    0m0.212s
sys     0m0.020s
```

Native Javascript performance on this benchmark is slightly better than Python.

### QuickJS

Compiling a plain JavaScript file directly to a WASM binary isn’t supported 
 natively - JavaScript is typically interpreted or JITed. Instead, the common 
 approach is to compile a small JS engine (like QuickJS) to WASM and then have
 it run the JS code. QuickJS executable (in WASM) is ~1MB.

A WASI enabled QuickJS WASM binary can be downloaded from the QuickJS-ng site.
 For this experiment, I used [v0.8.0](https://github.com/quickjs-ng/quickjs/releases/download/v0.8.0/qjs-wasi.wasm).

The original JS code needed minor modifications to make it run in WASM (see
 [caveat](#caveat) below for rational). The checked in code has these already.

- There is no `process` package so access to `process.argv` is undefined.
 QuickJS has an alternative called `scriptArgs` that can be used.
- there is no `console` package, so a simple `console` object is created with
 `log` and `error` functions calling `print`.

```sh
time wasmtime --dir=. qjs-wasi.wasm -- ./nprime.js 100000
The 100000th prime number is 1299709

real    0m0.727s
user    0m0.696s
sys     0m0.020s
```

Running the JS code through QuickJS and using `wasmtime` runtime is 3.5x slower than
 "native" JS on node.js. Note that `wasmtime` was a little slower than `wasmer` on
 Python test.

### Javy

[Javy](https://github.com/bytecodealliance/javy) provides a WASM based embedded
 JavaScript runtime that can execute JavaScript. It is used almost exclusively
 in a [WASI command pattern](https://github.com/WebAssembly/WASI/blob/snapshot-01/design/application-abi.md):
 any input must be passed via stdin and any output will be placed in stdout.
 It is not suitable for running arbitrary JS code (however, it may be useful for
 MCP as MCP servers can support stdin/stdout transport in invocation). This is
 put on hold.

## Caveat

*By design* WASM does not support access to OS resources, such as files, network,
 and multiprocessing. This could limiting, depending on the use case. The main
 workaround is to provide these via WASI or external (Host) functions - in both
 cases the access is mediated and can be governed by policy. As an example,
 see the [wasmedge extensions](https://wasmedge.org/docs/start/wasmedge/features#cloud-native-extensions).
