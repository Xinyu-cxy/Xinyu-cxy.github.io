# Structured Query Language

Contents: data definition, data modification, query, view, authorization, assertion

## 1. Data Definition

### CREATE TABLE

```sql
CREATE TABLE Branch
(
    branch_id VARCHAR(15),
    name VARCHAR(30) NOT NULL,
    asset INT UNSIGNED NOT NULL,
    PRIMARY KEY (branch_id)
);
```

- name, type
- constraint

```sql
CREATE TABLE Owner
(
    account_id VARCHAR(15),
    customer_id VARCHAR(15),
    PRIMARY KEY (account_id, customer_id),
    FOREIGN KEY (account_id) REFERENCES Account(account_id),
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);
```

### DROP TABLE

```sql
DROP TABLE Branch;
```

### ALTER TABLE

ADD/DROP column

```sql
ALTER TABLE Branch ADD branch_phone VARCHAR(20);
ALTER TABLE Branch DROP branch_phone;
```

ADD/DROP constraints

```sql
ALTER TABLE Branch ADD PRIMARY KEY (branch_id);
ALTER TABLE Owner ADD FOREIGN KEY (customer_id)
REFERENCES Customer (customer_id);
```

## 2. Data Modification

### INSERT

```sql
INSERT INTO Branch VALUES ('B1', 'Central', 1);
INSERT INTO Branch VALUES ('B1', ......)
                          ('B2', ......);
```

```sql
LOAD DATA LOCAL INFILE 'text.txt'
INTO TABLE Branch
FIELDS TERMINATED BY ';'
LINES TERMINATED BY '\n';
```

### DELETE

```sql
DELETE FROM Branch;
DELETE FROM Branch WHERE name = 'CENTRAL';
```

### UPDATE

```sql
UPDATE Branch
SET asset = 0
WHERE branch_id = 'B1';
```

```sql
UPDATE Account
SET balance = balance * 1.06
WHERE balance >500;
```

```sql
UPDATE Account
SET balance = CASE
WHEN balance <500 THEN balance *1.05
ELSE balance *1.06
END;
```

## 3. Query

```sql
SELECT name FROM Customer;
SELECT * FROM Customer;
SELECT loan_id, amount /7.8 FROM Loan;
```

Cartesian product

```sql
SELECT * FROM Customer, Borrower;
```

Where

```sql
SELECT Borrower.loan_id, Customer.name
FROM Customer, Borrower
WHERE Customer.customer_id = Borrower.customer_id;
```

```sql
SELECT loan_id
FROM Loan
WHERE branch_id = 'B1' AND amount >1200;
```

```sql
SELECT DISTINCT Branch.name
FROM Branch , Loan
WHERE Branch.branch_id = Loan.branch_id;
```

AS

```sql
SELECT DISTINCT Branch.name AS 'Branch name'
......
```

Rename

```sql
SELECT DISTINCT B.name AS 'Branch name'
FROM Branch B, Loan L
WHERE B.branch_id = L.branch_id;
```

Pattern:

- `%` : matches any substring
- `_` : matches any character

```sql
SELECT name
FROM Customer
WHERE address LIKE '%3n%';
```

### ORDER BY

`DESC` descending
`ASC` ascending ← default

```sql
SELECT name
FROM Customer
WHERE ORDER BY name ASC;
```

```sql
SELECT *
FROM Loan
ORDER BY branch_id ASC , amount DESC;
```

### Aggregation

AVG, SUM, MIN, MAX, COUNT

```sql
SELECT AVG(balance)
FROM Account
WHERE branch_id = 'B2';
```

```sql
SELECT branch_id, AVG(balance)
FROM Account
GROUP BY branch_id;
```

```sql
SELECT branch_id, AVG(balance)
FROM Account
GROUP BY branch_id
HAVING AVG(balance) >= 650;
```

### Nested Query

```sql
WHERE column IN ()
WHERE column ? ALL()
WHERE column ? SOME()
WHERE EXISTS ()
```

```sql
SELECT E.name
FROM Employee E
WHERE E.employee_id IN (
    SELECT W.employee_id
    FROM Works_in W
    WHERE W.department_id =1
);
```

```sql
SELECT D.name
FROM Department D
WHERE D.budget > ALL (
    SELECT D2.budget
    FROM Department D2
    WHERE D2.department_id IN (
        SELECT W.department_id
        FROM Works_in W
        WHERE W.employee_id =4
    )
);
```

```sql
SELECT D.name
FROM Department D
WHERE D.budget > SOME (
    SELECT D2.budget
    FROM Department D2
    WHERE D2.department_id IN (
        SELECT W.department_id
        FROM Works_in W
        WHERE W.employee_id =2
    )
);
```

```sql
SELECT E.name
FROM Employee E
WHERE EXISTS (
    SELECT *
    FROM Works_in W
    WHERE E.employee_id = W.employee_id AND
    W.department_id =1
);
```

### Set operation: UNION, EXCEPT, INTERSECT

```sql
SELECT E.name
FROM Employee E, Works_in W
WHERE E.employee_id = W.employee_id AND W.department_id =1

UNION / INTERSECT

SELECT E.name
FROM Employee E, Works_in W
WHERE E.employee_id = W.employee_id AND W.department_id =3

```

```sql
...... =1 EXCEPT ...... =3
```

### Join

LEFT OUTER JOIN/ RIGHT OUTER JOIN  
Left table all rows show; Right table fill null  
Two table not match → null

```sql
SELECT *
FROM Employee E, Department D
WHERE E.department_id = D.department_id
```

```sql
SELECT *
FROM Employee E
INNER JOIN Department D
ON E.department_id = D.department_id;
```

### NULL

```sql
SELECT name
FROM Employee
WHERE salary IS NULL;
```

- SUM, AVG, MIN, MAX, COUNT(expression) ignore NULL inputs
- COUNT(*) count rows and does not ignore
- null: Value not exist
- UNKNOWN: TRUE, FALSE, UNKNOWN
  - arithmetic expression involving null is null
    - null +5 =null
  - ordinary comparison = < > with null evaluate to UNKNOWN
    - 5 < null, null = null return UNKNOWN
  - IS UNKNOWN
  - for WHERE, HAVING, predict false if it evaluates to UNKNOWN.

## 4. VIEW

```sql
CREATE VIEW Employee_hide_salary AS (
    SELECT employee_id , name
    FROM Employee
);
```

```sql
CREATE VIEW Dept_size(name, num_of_employee) AS (
    SELECT D.name, COUNT(*)
    FROM Department D, Works_in W
    WHERE D.department_id = W.department_id
    GROUP BY W.department_id
);
```

## 5. Authorization

table/view, user/role

```sql
GRANT SELECT ON Department TO Johnson, Brown;
GRANT UPDATE(budget) ON Department TO Johnson;
GRANT UPDATE (budget) ON Department TO manager;
(REVOKE)
```

```sql
CREATE Role manager;
GRANT manager TO Brown;
CREATE USER Johnson IDENTIFIED BY 'password'
```

## 6. Assertion

```sql
CREATE ASSERTION EmpsNoLessThanDepts
CHECK (
    (SELECT COUNT(*) FROM Department) <=
    (SELECT COUNT(*) FROM Employee)
);
```
