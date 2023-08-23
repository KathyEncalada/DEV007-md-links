const https = require("https")
const {mdLinks} = require("../index.js");
jest.mock("https");

const obj_result_true = [
    {
      file: "/Users/katherineencalada/Desktop/DEV007-md-links/files/file2.md",
      href: "https://google.com/juanito",
      text: "dayliMotion",
      ok:"ok",
      status: 200,
    },
  ];

  const obj_result_false = [
    {
      file: "/Users/katherineencalada/Desktop/DEV007-md-links/files/file2.md",
      href: "https://google.com/juanito",
      text: "dayliMotion",
    },
  ];

const path  = "./files/file2.md"
test(`mdLinks con validate:true`, async () => {
  https.get = jest.fn().mockImplementation((url, callback) => {
    const mockResponse = {
      statusCode: 200,
      on: (event, handler) => {
        if (event === "end") {
          handler();
        }
      },
    };

    callback(mockResponse);
    return {
      on: jest.fn(),
    };
  });
    const result = await mdLinks(path,{validate:true});
    expect(result).toEqual(obj_result_true);
  });

test(`mdLinks sin agumento validate`, async () => {
    const result = await mdLinks(path);
    expect(result).toEqual(obj_result_false);
});
  
test('mdLinks sin agumentos', () => {
    return expect(mdLinks()).rejects.toEqual("The path must be a string");
  });
  