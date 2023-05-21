<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/74085997-1d3c1400-4a7f-11ea-9abf-81a4352f827f.png">  
</p>
<p align="center">
    ⚡🔒 <i> Generate functions that do not allow parallel executions</i> 🔒 ⚡
    <br>
    <br>
    <a href="https://github.com/garronej/run-exclusive/actions">
      <img src="https://github.com/garronej/run_exclusive/workflows/ci/badge.svg?branch=develop">
    </a>
    <a href="https://bundlephobia.com/package/run-exclusive">
      <img src="https://img.shields.io/bundlephobia/minzip/run-exclusive">
    </a>
    <a href="https://www.npmjs.com/package/run-exclusive">
      <img src="https://img.shields.io/npm/dw/run-exclusive">
    </a>
    <a href="https://www.npmjs.com/package/run-exclusive">
      <img src="https://img.shields.io/npm/v/run-exclusive?logo=npm">
    </a>
    <a href="https://deno.land/x/run_exclusive">
        <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Flatest-version%2Fx%2Frun_exclusive%2Fmod.ts">
    </a>  
    <a href="https://github.com/garronej/run-exclusive/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/run-exclusive">
    </a>
</p>  

---

Let you create functions that enforce no more than one execution happens at the same time.  
If the function is called again while there is already an execution ongoing the new call will be queued and executed once all the queued calls have completed.

This is a higher-level approach to the problem addressed by [`DirtyHairy/async-mutex`](https://www.npmjs.com/package/async-mutex).    

<b>Suitable for any JS runtime env (deno, node, old browser, react-native ...)</b>
- ✅ It is both a [Deno](https://deno.land/x/run_exclusive) and an [NPM](https://www.npmjs.com/run-exclusive) module. 
- ✅ Lightweight, no dependency.
- ✅ No polyfills needed, the NPM module is transpiled down to ES3   

# Examples

## Basic example

```typescript
import * as runExclusive from "run-exclusive";

const f= runExclusive.build(async ()=> {

    await new Promise(resolve=> setTimeout(resolve, 1000));

    console.log("Hello world");

});

f();
f();
```
Result:  
```bash
# One second..
Hello World
# One second
Hello World
```

## Group of mutually run exclusive functions

```typescript
import * as runExclusive from "run-exclusive";

const groupRef= runExclusive.createGroupRef();

const f1= runExclusive.build(groupRef, async ()=> {

    await new Promise(resolve=> setTimeout(resolve, 1000));

    console.log("Hello world 1");

});

const f2= runExclusive.build(groupRef, async ()=> {

    await new Promise(resolve=> setTimeout(resolve, 1000));

    console.log("Hello world 2");

});

f1();
f2();
```
Result:  
```bash
# One second..
Hello World 1
# One second
Hello World 2
```

# Install / Import

## Deno

```typescript
import * as runExclusive from "https://deno.land/x/run_exclusive/mod.ts";
```

## Other javascript runtime environnement: 

```bash
$ npm install --save run-exclusive
```
```typescript
import * as runExclusive from "run-exclusive";
```

# Try it now

Thanks to Stackblitz you can try this lib within your browser like if you where in VSCode. 

![Screenshot 2020-02-14 at 12 48 04](https://user-images.githubusercontent.com/6702424/74528376-70531280-4f28-11ea-9545-46d258b74454.png)

[__Run the example__](https://stackblitz.com/edit/run-exclusive-hello-world?embed=1&file=index.ts)

# Table of content

- [Examples](#examples)
  - [Basic example](#basic-example)
  - [Group of mutually run exclusive functions](#group-of-mutually-run-exclusive-functions)
- [Install / Import](#install--import)
  - [Deno](#deno)
  - [Other javascript runtime environnement:](#other-javascript-runtime-environnement)
  - [Import from HTML, with CDN](#import-from-html-with-cdn)
- [Try it now](#try-it-now)
- [Table of content](#table-of-content)
- [Documentation](#documentation)
  - [``build()``](#build)
  - [``createGroupRef()``](#creategroupref)
  - [``buildMethod()``](#buildmethod)
  - [``buildCb()`` and ``buildMethodCb()``](#buildcb-and-buildmethodcb)
  - [Queued calls](#queued-calls)
    - [``getQueuedCallCount()``](#getqueuedcallcount)
    - [``cancelAllQueuedCalls()``](#cancelallqueuedcalls)
    - [``isRunning()``](#isrunning)
    - [``getPrComplete()``](#getprcomplete)

# Documentation

## ``build()``

Let us compare regular functions with `run-exclusive` functions.

````typescript
let alphabet= "";

//This function wait a random time then append a letter to alphabet.
async function spell(letter: string): Promise<string>{

    await new Promise(
        resolve=> setTimeout(
            resolve, 
            Math.random()*100
        )
    );

    alphabet+=letter;

    return alphabet;

}

spell("a");
spell("b");
spell("c").then( message => console.log(message)); 
//We cant predict what will be printed to the console,
//it can be "c", "ca", "ac", "cb", "bc", "cab", "cba", "bac", "bca", "acb" or "abc"

````
Now the same example using ``run-exclusive``:  

````typescript
import * as runExclusive from "run-exclusive";

let alphabet= "";

const spell= runExclusive.build(
    async (letter: string): Promise<string> => {

        await new Promise(
            resolve=>setTimeout(
                resolve, 
                Math.random()*100
            )
        ); 

        alphabet+=letter;

        return alphabet;

    }
);

spell("a");
spell("b");
spell("c").then( message => console.log(message)); // Always prints "abc"

````

The types definition of the function passed as argument are conserved.
![Screenshot 2020-02-08 at 15 42 09](https://user-images.githubusercontent.com/6702424/74087111-9a6c8680-4a89-11ea-99f5-d5db809835f2.png)

## ``createGroupRef()``

To share a unique lock among a group of functions.

````typescript
import * as runExclusive from "run-exclusive";

let alphabet= "";

const groupSpelling= runExclusive.createGroupRef();

const spellUpperCase= runExclusive.build(groupSpelling
    async (letter: string) => {

        await new Promise<void>(resolve=> setTimeout(resolve, Math.random()*100));

        alphabet+=letter.toUpperCase();

    }
);

const spellLowerCase= runExclusive.build(groupSpelling
    async (letter: string) => {

        await new Promise<void>(resolve=> setTimeout(resolve, Math.random()*100));

        alphabet+=letter.toLowerCase();

    }
);

spell("a");
spellUpperCase("b");
spell("c").then(()=> console.log(alphabet)); //prints "aBc".
````

## ``buildMethod()``

If you define run exclusive class methods chances are you want the lock to be restricted
to the class's object instance.  
This is what ``buildMethod()``is for.

````typescript

class Student {

    public alphabet= "";

    public spell= runExclusive.buildMethod(
       async (letter: string) => {

            await new Promise<void>(resolve=> setTimeout(resolve, 1000));

            this.alphabet+=letter.toLowerCase();

        }
    );

}

const alice= new Student();
const bob= new Student();

alice.spell("A");
bob.spell("a");
alice.spell("B");
bob.spell("b");
alice.spell("C").then( ()=> console.log(alice.alphabet)); //prints after 3s: "ABC"
bob.spell("c").then( ()=> console.log(bob.alphabet)); //prints after 3s: "abc"

````

## ``buildCb()`` and ``buildMethodCb()``

`buildCb()` is the pending of `build()` for creating run exclusive functions that complete by invoking a callback. (Instead of resolving a promise).

The only valid reason to use this instead of `build()` is to be able to retrieve the result synchronously. 

<b><span style="color:red"> WARNING:</span></b> If you make the callback optional the argument before it cannot be a function.  
Be aware that the compiler won't warn you against it.  
Example: ``(getLetter: ()=> string, callback?: (message: string)=> voidA) => {..}``  
is NOT a valid function to pass to ``buildCb()`` or ``buildMethodCb()``.
*Thanks @AnyhowStep*   

<b>WARNING:</b> The function should never throw as the exception wont be catchable.

````typescript

let alphabet= "";

const spell= runExclusive.buildCb(
    (letter: string, callback?: (message: string)=> void) => {

        setTimeout(()=>{

            alphabet+= letter;

            /*
            Callback must always be called, event if the user 
            does not provide one, it is the only way for the module
            to know that the function has completed it's execution.
            You can assume that the callback function is not undefined.
            To tell if the user has provided à callback you can access (callback as any).hasCallback;
            */
            callback!(alphabet);

        }, Math.rand()*100);

    }
};

spell("a");
spell("b");
spell("c", message => console.log(message)); // prints "abc"

````

NOTE: ``runExclusive.buildMethodCb()`` also available.

## Queued calls 

It is possible to check, for a given run exclusive function, if there is currently
an ongoing execution and how many calls are queued.
It is also possible to cancel the queued calls.

### ``getQueuedCallCount()``

 Get the number of queued call of a run-exclusive function. 
 Note that if you call a runExclusive function and call this 
 directly after it will return 0 as there is one function call
 execution ongoing but 0 queued.  
 
 The classInstanceObject parameter is to provide only for the run-exclusive
 function created with 'buildMethod[Cb].

```typescript
export declare function getQueuedCallCount(
    runExclusiveFunction: Function, 
    classInstanceObject?: Object
): number;
```

### ``cancelAllQueuedCalls()``
Cancel all queued calls of a run-exclusive function.
Note that the current running call will not be cancelled.  

The classInstanceObject parameter is to provide only for the run-exclusive
function created with 'buildMethod[Cb].
```typescript
export declare function cancelAllQueuedCalls(
    runExclusiveFunction: Function, 
    classInstanceObject?: Object
): number;
```
### ``isRunning()``

Tell if a run-exclusive function has an instance of it's call currently being
performed.

The classInstanceObject parameter is to provide only for the run-exclusive
function created with 'buildMethod[Cb].
```typescript
export declare function isRunning(
    runExclusiveFunction: Function, 
    classInstanceObject?: Object
): boolean;
```

### ``getPrComplete()``

Return a promise that resolve when all the current queued call of a runExclusive functions have completed.  
The classInstanceObject parameter is to provide only for the run-exclusive
function created with 'buildMethod[Cb].

````typescript
export declare function getPrComplete(
    runExclusiveFunction: Function, 
    classInstanceObject?: Object
): Promise<void>;
````
