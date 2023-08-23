const https = require('https');
const {resolveDirectory, readRecords, getRequest} = require('../utils')

jest.mock('https');

const testCases = [
    {
      input: "/Users/katherineencalada/Desktop/DEV007-md-links/files/",
      expected: [
        "/Users/katherineencalada/Desktop/DEV007-md-links/files/file.md",
        "/Users/katherineencalada/Desktop/DEV007-md-links/files/file2.md",
        "/Users/katherineencalada/Desktop/DEV007-md-links/files/file3.md",
      ],
    },
    {
      input: "./files/file.md",
      expected: ["/Users/katherineencalada/Desktop/DEV007-md-links/files/file.md"],
    },
    {
      input: "./files/file2.md",
      expected: ["/Users/katherineencalada/Desktop/DEV007-md-links/files/file2.md"],
    },
  ];

  testCases.forEach((testCases) => {
    test(`Testing principal Function with input ${testCases.input}`, async () => {
      const result = await resolveDirectory(testCases.input);
      expect(result).toEqual(testCases.expected);
    });
  });

  test(`Resolver Directorio con un archivo que no existe`, () => {
    const nonExistentPath = "no-existo.md";
  
    return expect(resolveDirectory(nonExistentPath)).rejects.toEqual(
      "/Users/katherineencalada/Desktop/DEV007-md-links/no-existo.md Directory/File not found"
    );
  });

  test(`resolverDirectorio con un archivo que no es .md`, () => {
    const noMdPath = "thumb.png";
  
    return expect(resolveDirectory(noMdPath)).rejects.toEqual(
        "/Users/katherineencalada/Desktop/DEV007-md-links/thumb.png is not a markdown"
    );
  });

  test(`resolverDirectorio con una entrada que no es tipo string`, () => {
    const nonString = { key: "value" };
  
    return expect(resolveDirectory(nonString)).rejects.toEqual(
      "The path must be a string"
    );
  });


  test(`readRecords`, async () => {
    const obj = [
      {
        "file": "/Users/katherineencalada/Desktop/DEV007-md-links/files/file2.md",
        "href": "https://google.com/juanito",
        "text": "dayliMotion",
    
      },
    ];
    const result = await readRecords(testCases[2].expected);
    expect(result).toEqual(obj);
  });

  test(`petición Https con status ok `, async () => {
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
   const link = { href: "https://existementis.html" };
 
   return getRequest(link).then((result) => {
     expect(result.status).toBe(200);
   });
 });


 test(`petición Https con status 404 `, async () => {
    https.get = jest.fn().mockImplementation((url, callback) => {
      const mockResponse = {
        statusCode: 404,
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
    const link = { href: "https://linkroto.html" };
    getRequest(link).then((result) => {
      // Verifica los resultados esperados
      expect(result.ok).toBe("fail");
      expect(result.status).toBe(404);
  
    });
  });

  test("Prueba de getRequest con error de conexión", async () => {
    const mockGet = jest.spyOn(https, "get");
  
    const error = new Error("Error de conexión");
    const resMock = {
      on: jest.fn().mockImplementation((event, eventCallback) => {
        if (event === "error") {
          eventCallback(error);
        }
      }),
    };
    mockGet.mockReturnValueOnce(resMock);
    const link = { href: "https://nohayconexion.com" };
    return getRequest(link).then((result) => {
      expect(result.status).toBe("error");
      mockGet.mockRestore();
    });
  });