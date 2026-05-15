import { spawnAsync } from "cross-spawn";
import fs from "fs-extra";
import minimist from "minimist";
import path from "path";
import pc from "picocolors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const argv = minimist(process.argv.slice(2));

const parseWorkspaces = spawnAsync("yarn", ["workspaces", "list", "--no-private", "--json"], {
  cwd: process.cwd()
}).then((o) =>
  o.stdout
    .split(/\r?\n/gm)
    .filter((str) => str.length > 4)
    .map((str) => {
      const parse: { location: string; name: string } = JSON.parse(str.trim());
      parse.location = path.join(__dirname, parse.location);
      return parse;
    })
    .filter((o) => fs.existsSync(o.location))
);

async function buildPack(workspaces: Awaited<typeof parseWorkspaces>) {
  if (workspaces.length === 0) return console.log("workspaces empty");

  const runBuild = async (wname: string, clean?: boolean) => {
    // activate clean when argument -c or --clean exist and clean option is undefined
    if (typeof clean === "undefined") clean = argv["c"] || argv["clean"];

    // determine current workspace
    const workspace = workspaces.filter((o) => o.name === wname)[0];
    if (!workspace) throw new Error("workspace " + wname + " not found");

    if (clean) {
      await spawnAsync("yarn", ["run", "clean"], {
        cwd: workspace.location
      });

      await spawnAsync("yarn", ["run", "build"], {
        cwd: workspace.location
      });
    } else {
      await spawnAsync("yarn", ["run", "build"], {
        cwd: workspace.location
      });
    }

    await spawnAsync("yarn", ["workspace", wname, "pack"], {
      cwd: __dirname
    });

    if (typeof workspace === "object") {
      const tarballName = workspace.name + ".tgz";
      const tarballPath = path.join(workspace.location, tarballName);
      const originalTarballPath = path.join(workspace.location, "package.tgz");

      // rename package.tgz to {workspace.name}.tgz
      if (fs.existsSync(originalTarballPath)) {
        fs.renameSync(originalTarballPath, tarballPath);
      } else {
        console.log(originalTarballPath + " not found");
      }

      // move {workspace.name}.tgz to releases/{workspace.name}.tgz
      if (fs.existsSync(tarballPath)) {
        const dest = path.join(__dirname, "releases", tarballName);

        if (!fs.existsSync(path.dirname(dest))) {
          fs.mkdirSync(path.dirname(dest));
        }

        if (fs.existsSync(dest)) {
          fs.rmSync(dest);
        }

        fs.renameSync(tarballPath, dest);
      } else {
        console.log(tarballPath + " not found");
      }
    } else {
      console.log(wname, "is not workspace");
    }

    return console.log(
      wname.padEnd(19),
      ((clean ? pc.red("clean") + "->" : "") + pc.green("build") + "->" + pc.yellow("pack") + " successful").trim()
    );
  };

  return new Promise((res: (...args: any[]) => void) => {
    runBuild("hexo-theme-flowbite").then(res);
  }).then(() => workspaces);
}

parseWorkspaces.then(buildPack);
