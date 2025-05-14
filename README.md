### Model Training
Machine model was trained through the spider dataset based on the google/t5-flan model
input format is in the form of:

- Schema: `TABLE artists (id ,name); TABLE sqlite_sequence (name ,seq) TABLE .... `

- Question: `What are the names of the countries and average invoice size of the top countries by size? `

- Target: `SELECT billing_country ,  AVG(total) FROM invoices GROUP BY billing_country ORDER BY AVG(total) DESC LIMIT 10;`

In the future I would like to implement a better way to tokenize the input to fit within 1024 token length. With incorperating primary and foreign keys. In addition, the penalitization of generating sql queries that cannot be interpreted. This can be done why running them through the associated .sqlite files provided.

### Deployed on https://text2-sql-81ui-daoglrmol-bryanhuynhs-projects.vercel.app/
