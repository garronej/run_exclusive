

<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/74085997-1d3c1400-4a7f-11ea-9abf-81a4352f827f.png">  
</p>
<p align="center">
    ⚡🔒 <i> Generate functions that do not allow parallel executions</i> 🔒 ⚡
    <br>
    <br>
    <img src="https://img.shields.io/bundlephobia/min/run-exclusive">
    <img src="https://img.shields.io/bundlephobia/minzip/run-exclusive">
    <img src="https://img.shields.io/david/garronej/run-exclusive">
    <img src="https://img.shields.io/npm/l/run-exclusive">
</p>  

---

Let you create functions that enforce no more than one execution happens at the same time.  
If the function is called again while there is already an execution ongoing the new call will be queued and executed once all the queued calls have completed.

This is a higher-level approach to the problem addressed by [`DirtyHairy/async-mutex`](https://www.npmjs.com/package/async-mutex).    
While being fitted for a smaller set of use-cases, this library is way less verbose and much easier to use than `async-mutex` is.

 <b>Browserify friendly:</b>

- No polyfills needed ✅  
- Transpiled down to ES3 ✅  
- Ultra light ✅

## Usage

Let us compare a run-exclusive function with a regular function.

### Regular function

````typescript

let alphabet= "";

//This function wait a random time then append a letter to alphabet.
async function spell(letter: string): Promise<string>{

    await new Promise<void>(resolve=> setTimeout(resolve, Math.random()*100));

    alphabet+=letter;

    return alphabet;

}

spell("a");
spell("b");
spell("c").then( message => console.log(message)); 
//We cant predict what will be printed to the console,
//it can be "c", "ca", "ac", "cb", "bc", "cab", "cba", "bac", "bca", "acb" or "abc"

````

### Run exclusive function


````typescript

import * as runExclusive from "run-exclusive";

let alphabet= "";

const spell= runExclusive.build(
    async (letter: string): Promise<string> => {

        await new Promise<void>(resolve=> setTimeout(resolve, Math.random()*100));

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


## Sharing a unique lock among a group of functions

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

## Defining class method

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

let alice= new Student();
let bob= new Student();

alice.spell("A");
bob.spell("a");
alice.spell("B");
bob.spell("b");
alice.spell("C").then( ()=> console.log(alice.alphabet)); //prints after 3s: "ABC"
bob.spell("c").then( ()=> console.log(bob.alphabet)); //prints after 3s: "abc"

````

## Using callback instead of promises.

`buildCb()` is the pending of `build()` for creating run exclusive functions that complete by invoking a callback. (Instead of resolving a promise).

The only valid reason to use this instead of `build()` is to be able to retrieve the result synchronously. 

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

## Checking the queuedCalls of a run exclusive function

It is possible to check, for a given run exclusive function, if it is currently
an ongoing execution and how many calls are queued.
It is also possible to cancel the queued calls.

````typescript
/**
 *
 * Get the number of queued call of a run-exclusive function. 
 * Note that if you call a runExclusive function and call this 
 * directly after it will return 0 as there is one function call
 * execution ongoing but 0 queued.
 * 
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 *
 * */
export declare function getQueuedCallCount(runExclusiveFunction: Function, classInstanceObject?: Object): number;
/**
 *
 * Cancel all queued calls of a run-exclusive function.
 * Note that the current running call will not be cancelled.
 *
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 *
 */
export declare function cancelAllQueuedCalls(runExclusiveFunction: Function, classInstanceObject?: Object): number;
/**
 * Tell if a run-exclusive function has an instance of it's call currently being
 * performed.
 *
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 */
export declare function isRunning(runExclusiveFunction: Function, classInstanceObject?: Object): boolean;
/**
 * Return a promise that resolve when all the current queued call of a runExclusive functions
 * have completed.
 *
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 */
export declare function getPrComplete(runExclusiveFunction: Function, classInstanceObject?: Object): Promise<void>;
````

