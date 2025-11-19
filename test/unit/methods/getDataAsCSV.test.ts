import { assertEquals } from "@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";

Deno.test("should return the whole data from a table as CSV", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  const csv = await table.getDataAsCSV();

  const expectedCSV =
    `Name,Hire date,Job,Salary,Department or unit,End-of_year-BONUS?
"OConnell, Donald",21-JUN-07,Clerk,2600,50,"1,94%"
"OConnell, Donald",21-JUN-07,Clerk,2600,50,"1,94%"
"Grant, Douglas",13-JAN-08,Clerk,NaN,50,"23,39%"
,17-SEP-03,Assistant,4400,10,"17,51%"
"Hartstein, Michael",17-FEB-04,Manager,13000,20,"2,71%"
"Fay, Pat",17-AUG-05,Representative,6000,20,"18,68%"
"Mavris, Susan",07-JUN-02,Salesperson,6500,40,"23,47%"
NaN,07-JUN-02,Salesperson,10000,xyz,"17,63%"
"Higgins, Shelley",07-JUN-02,Manager,12008,110,"17,09%"
null,07-JUN-02,Accountant,8300,110,"15,7%"
"King, Steven",,President,24000,90,"2,46%"
"Kochhar, Neena",21-SEP-05,Vice-president,&6%,90,"11,6%"
"De Haan, Lex",null,Vice-president,17000,90,"23,43%"
"Hunold, Alexander",03-JAN-06,Programmer,9000,60,"23,01%"
"Ernst, Bruce",21-MAY-07,Programmer,6000,60,"25,91%"
"Austin, David",NaN,Programmer,4800,null,"6,89%"
"Pataballa, Valli",abc,Programmer,,60,"1,62%"
"Lorentz, Diana",07-ARB-07,Programmer,4200,60,"13,17%"
"Greenberg, Nancy",17-AUG-02,Manager,12008,100,"74,69%"
"Faviet, Daniel",16-AUG-02,Accountant,9000,100,"2,92%"
"Chen, John",28-SEP-05,Accountant,8200,100,"9,31%"
"Sciarra, Ismael",30-SEP-05,Accountant,7700,100,"13,18%"
"Urman, Jose Manuel",07-MAR-06,Accountant,7800,100,"1,33%"
"Popp, Luis",07-DEC-07,Accountant,6900,100,"2,98%"
"Raphaely, Den",07-DEC-02,Manager,11000,30,"3,35%"
"Khoo, Alexander",18-MAY-03,Clerk,3100,30,"19,81%"
"Baida, Shelli",24-DEC-05,Clerk,2900,30,"11,06%"
"Tobias, Sigal",24-JUL-05,NaN,2800,,undefined
"Himuro, Guy",15-NOV-05,Clerk,2600,30,"25,98%"
"Colmenares, Karen",10-AUG-07,Clerk,2500,30,"15,8%"
"Weiss, Matthew",18-JUL-04,Manager,8000,50,"25,17%"
"Fripp, Adam",10-APR-05,Manager,8200,50,21%
"Kaufling, Payam",01-MAY-03,Manager,7900,undefined,"21,33%"
"Vollman, Shanta",10-OCT-05,null,6500,50,"3,45%"
"Mourgos, Kevin",undefined,Manager,5800,50,"19,07%"
"Nayer, Julia",16-JUL-05,Clerk,3200,50,"18,7%"
"Mikkilineni, Irene",28-SEP-06,Clerk,2700,50,"11,82%"
"Landry, James",14-JAN-07,Clerk,2400,50,NaN
"Markle, Steven",NaN,Clerk,2200,50,"11,26%"
"Bissot, Laura",20-AUG-05,undefined,3300,50,"4,53%"
"Atkinson, Mozhe",30-OCT-05,Clerk,undefined,50,"9,61%"
"Marlow, James",16-FEB-05,Clerk,2500,50,"15,74%"
"Olson, TJ",10-APR-07,Clerk,2100,null,"22,3%"
undefined,14-JUN-04,Clerk,3300,50,"18,54%"
"Rogers, Michael",26-AUG-06,Clerk,2900,50,null
"Gee, Ki",12-DEC-07,NaN,2400,50,"12,64%"
"Philtanker, Hazel",06-FEB-08,Clerk,2200,NaN,"24,17%"
"Ladwig, Renske",14-JUL-03,,3600,50,"17,86%"
"Stiles, Stephen",26-OCT-05,Clerk,3200,50,
"Seo, John",12-FEB-06,Clerk,2700,50,"0,16%"
"Patel, Joshua",06-APR-06,Clerk,2500,50,"16,19%"`;

  assertEquals(csv, expectedCSV);
  await sdb.done();
});

Deno.test("should return data from a table based on a condition as CSV", async () => {
  const sdb = new SimpleDB();
  const table = sdb.newTable("data");
  await table.loadData("test/data/files/employees.csv");
  const csv = await table.getDataAsCSV({
    conditions: "Job = 'Programmer'",
  });

  const expectedCSV =
    `Name,Hire date,Job,Salary,Department or unit,End-of_year-BONUS?
"Hunold, Alexander",03-JAN-06,Programmer,9000,60,"23,01%"
"Ernst, Bruce",21-MAY-07,Programmer,6000,60,"25,91%"
"Austin, David",NaN,Programmer,4800,null,"6,89%"
"Pataballa, Valli",abc,Programmer,,60,"1,62%"
"Lorentz, Diana",07-ARB-07,Programmer,4200,60,"13,17%"`;

  assertEquals(csv, expectedCSV);
  await sdb.done();
});
