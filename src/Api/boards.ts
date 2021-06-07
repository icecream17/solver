export default {
   "Badly made moderate board":
   "170050003009000028000600170080004000000070804950200001003007000610030900200000050",

   "Daily tough sudoku":
   "000000000006042190907030086100020903000000000702080004210070509054610200000000000",

   "Easter monster":
   "100000002090400050006000700050903000000070000000850040700000600030009080002000001",

   "Solved board":
   "123456798759318264684297315861729543395864127472135986236581479548972631917643852",

   "Easiest sudoku":
   "123456789406789123789123456912345678345678912678912345234567891567891234891234567",

   // Sudoku image: https://images.app.goo.gl/WwGo8iVk84awRgnC9
   // Actual website (scroll down to #482): https://www.puzzles.ca/sudoku_puzzles/sudoku_easy_481.html
   "Simple sudoku":
   "609004001800050000035109008008000004050000030400070052000001000001040000760930000",

   "No solved cells": `
   +--------------------------------------------------------------------------+
   | 1237    1256    36789  | 25789   4789    4569   | 1679    23457   1348   |
   | 2456    13489   3459   | 1356    3679    1247   | 2478    5789    12368  |
   | 2358    24789   1267   | 2489    123457  13468  | 34569   4568    1279   |
   |------------------------+------------------------+------------------------|
   | 1569    2578    3457   | 145678  3459    2356   | 234689  1236    146789 |
   | 3679    12348   2489   | 1236    56789   1569   | 2357    1489    4579   |
   | 14689   1567    234678 | 1237    12489   34578  | 1235    5789    6789   |
   |------------------------+------------------------+------------------------|
   | 24789   3678    1469   | 1346    1246    1357   | 5689    1256789 2345   |
   | 1238    4569    125678 | 3579    2347    2689   | 1479    1348    2356   |
   | 3457    3789    1256   | 23489   14568   256789 | 1578    23569   1457   |
   +--------------------------------------------------------------------------+`,

   "A lot of candidates but not that hard": `
   +-------------------------------+-------------------------------+-------------------------------+
   | 123456789 123456789 23456789  | 12346789  123456789 1246789   | 12346789  1234678   123456789 |
   | 123456789 135       23567     | 2356789   123456789 123456789 | 123456789 237       123456789 |
   | 123456789 123456789 123456789 | 1256789   123456789 1245789   | 123456789 12346789  123456789 |
   +-------------------------------+-------------------------------+-------------------------------+
   | 123456789 123456789 123456789 | 256789    123456789 123456789 | 123456789 123456789 123456789 |
   | 123456789 14        123456789 | 1245789   123456789 123456789 | 45        123456789 123456789 |
   | 123456789 123456789 123456789 | 12356789  123456789 123456789 | 123456789 123456789 123456789 |
   +-------------------------------+-------------------------------+-------------------------------+
   | 123456789 123456789 23456789  | 123456789 1234569   12346789  | 123456789 27        123456789 |
   | 123456789 123456789 123456789 | 123456789 13459     1469      | 123456789 123456789 123456789 |
   | 123456789 123456789 25        | 123456789 12345679  12345679  | 123456789 27        257       |
   +-------------------------------+-------------------------------+-------------------------------+`,

   "Invalid board":
   "400601056003030009208040020000005000000000320007806000000340053000019000000000000",

   "Very disconnected digits": `
      000300000
      840000076
      120600000
      000000907
      002000050
      670015080
      000058001
      900000000
      000000205
   `
} as const
