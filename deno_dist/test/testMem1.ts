
import * as runExclusive from "../lib/runExclusive.ts";

function print_mem() {

    const used = process.memoryUsage();
    for (let key in used) {
        console.log(`${key} ${Math.round((used as any)[key] / 1024 / 1024 * 100) / 100} MB`);
    }

}

class A {

    public alphabet= "";

    public myMethod = runExclusive.buildMethod(
        async (char: string) => {

            if( char === "a" ){

                await new Promise(resolve => process.nextTick(resolve));
                //await new Promise(resolve => setTimeout(resolve,0));

            }

            this.alphabet+= char;
        }
    );

}

(async () => {

    while (true) {

        for (let i = 0; i < 7000; i++) {

            const a = new A();

            a.myMethod("a");
            await a.myMethod("b");

            console.assert(a.alphabet === "ab");

        }

        print_mem();

    }

})();