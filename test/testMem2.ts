import * as runExclusive from "../lib/runExclusive.ts";

function print_mem() {

    const used = process.memoryUsage();
    for (let key in used) {
        console.log(`${key} ${Math.round((used as any)[key] / 1024 / 1024 * 100) / 100} MB`);
    }

}

console.log("GLOBAL");

(async () => {

    while (true) {

        for (let i = 0; i < 7000; i++) {

            let alphabet= "";

            const myFunction= runExclusive.build(async (char: string)=> {

                if( char === "a" ){

                    await new Promise(resolve=> process.nextTick(resolve));

                }

                alphabet+= char

            });

            myFunction("a");
            await myFunction("b");

            console.assert(alphabet === "ab");

        }

        print_mem();

    }

})();


