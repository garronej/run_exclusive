

process.on("unhandledRejection", error=> { 
    console.log("INTERNAL ERROR");
    console.log(error);
    throw error;
});

let n = process.argv[2];

if (n) {

    require("./test" + n);

} else {

    require("./legacyTests/index");

    for (let i = 1; i <= 18; i++) {

        try {
            require("./test" + i);
        } catch (error) {

            console.log(`Fail test ${i}`);

            throw error;


        }

    }


}