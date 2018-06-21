import * as runExclusive from "../lib/runExclusive";

let alphabet= "";

const myFunction = runExclusive.build(
    async (char: string) => {

        await new Promise(resolve=> setTimeout(resolve, 10));

        alphabet+= char;

    }
);


(async ()=>{


    myFunction("a");
    myFunction("b");

    runExclusive.getPrComplete(myFunction).then(()=> { 

        console.assert(alphabet === "ab");
    });

    await myFunction("c");

    console.assert(alphabet === "abc");

})();