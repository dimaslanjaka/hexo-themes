import * as croSpawn from "cross-spawn";
import { existsSync, mkdirSync, renameSync, rmSync } from "fs-extra";
import minimist from "minimist";
import path from "path";
import pc from "picocolors";

const argv = minimist(process.argv.slice(2));

const parseWorkspaces = croSpawn
  .async("yarn", ["workspaces", "list", "--no-private", "--json"], {
    cwd: process.cwd()
  })
  .then((o) =>
    o.stdout
      .split(/\r?\n/gm)
      .filter((str) => str.length > 4)
      .map((str) => {
        const parse: { location: string; name: string } = JSON.parse(str.trim());
        parse.location = path.join(__dirname, parse.location);
        return parse;
      })
      .filter((o) => existsSync(o.location))
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
      await croSpawn.async("yarn", ["run", "clean"], {
        cwd: workspace.location
      });
      await croSpawn.async("yarn", ["run", "build"], {
        cwd: workspace.location
      });
    } else {
      await croSpawn.async("yarn", ["run", "build"], {
        cwd: workspace.location
      });
    }
    await croSpawn.async("yarn", ["workspace", wname, "pack"], {
      cwd: __dirname
    });
    if (typeof workspace === "object") {
      const tarballName = workspace.name + ".tgz";
      const tarballPath = path.join(workspace.location, tarballName);
      const originalTarballPath = path.join(workspace.location, "package.tgz");

      // rename package.tgz to {workspace.name}.tgz
      if (existsSync(originalTarballPath)) {
        renameSync(originalTarballPath, tarballPath);
      } else {
        console.log(originalTarballPath + " not found");
      }
      // move {workspace.name}.tgz to releases/{workspace.name}.tgz
      if (existsSync(tarballPath)) {
        const dest = path.join(__dirname, "releases", tarballName);
        if (!existsSync(path.dirname(dest))) mkdirSync(path.dirname(dest));
        if (existsSync(dest)) rmSync(dest);
        renameSync(tarballPath, dest);
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
