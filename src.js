
const fs = require('fs');
const readline = require('readline');

function obj2string(obj) {
  const keys = Object.keys(obj);

  let data = "";
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = obj[key];

    data += `${key}=${value}\n`;
    // console.log(`${key}=${value}`);
  }

  return data;
}

function write_file(filename, data) {
  fs.writeFileSync(filename, data);
}

async function read_env(filename, obj) {
  const fileStream = fs.createReadStream(filename);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in filename as a single line break.

  for await (const line of rl) {
    // Each line in filename will be successively available here as `line`.
    obj = each_line(line, obj);
    // console.log(obj);
  }

  return obj;
}

// one line processing
function each_line(line, obj) {

  const words = line.split('=');

  // check is valid
  if (line.length > 0 && words.length > 1) {

    const key = words[0];
    const value = get_value(words);
    // console.log(`${key}=${value}`);

    obj = modify(obj, key, value);
  }
  return obj;
}

function get_value(array) {

  let result = '';
  for (let i = 1; i < array.length; i++) {
    if (i > 1) {
      result += '=';
    }
    result += array[i];
  }

  return result;
}

function modify(obj, key, value) {
  obj[key] = `${value}`;

  return obj;
}

async function main() {
  let env = {};

  // read test
  env = await read_env('env.txt', env);
  console.log("== original obj");
  console.log(obj2string(env));
  console.log("===============\n");

  env = modify(env, "DB_HOST", "unknown");
  console.log("== modified obj");
  console.log(obj2string(env));
  console.log("===============\n");

  // write test
  write_file("new_env.txt", obj2string(env));
}

main().then(() => {
  process.exit(0);
})
