Machine model was trained through the spider dataset based on the google/t5-flan model
input format is in the form of 
Schema: TABLE artists (id ,name); TABLE sqlite_sequence (name ,seq) TABLE .... 
Question: What are the names of the countries and average invoice size of the top countries by size? 
Target: SELECT billing_country ,  AVG(total) FROM invoices GROUP BY billing_country ORDER BY AVG(total) DESC LIMIT 10;
- Deployed on https://text2-sql-81ui-daoglrmol-bryanhuynhs-projects.vercel.app/
