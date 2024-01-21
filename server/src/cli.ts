import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";
import { downloadSqlite, uploadSqlite } from "./s3";

yargs(hideBin(process.argv))
  .command(
    "upload <file>",
    "upload a file to s3",
    (yargs) => {
      return yargs.positional("file", {
        describe: "the file to upload",
        type: "string",
      });
    },
    async (argv) => {
      console.log("uploading sqlite file to s3", argv.file);
      if (!argv.file) throw new Error("no file");
      const data = fs.readFileSync(argv.file);
      await uploadSqlite(data);
      console.log("Upload successful");
    }
  )
  .command(
    "download <file>",
    "download a file from s3",
    (yargs) => {
      return yargs.positional("file", {
        describe: "the file to download to",
        type: "string",
      });
    },
    async (argv) => {
      if (!argv.file) throw new Error("no file");
      const data = await downloadSqlite();
      fs.writeFileSync(argv.file, data);
      console.log("Download successful");
    }
  )
  .help().argv;
