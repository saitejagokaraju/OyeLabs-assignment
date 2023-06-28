SELECT
  customers.customerId,
  customers.name,
  GROUP_CONCAT(
    DISTINCT subjects.subjectName
    ORDER BY subjects.subjectName ASC SEPARATOR ','
  ) AS subjects
FROM
  customers
  INNER JOIN subject_student_mapping ON customers.customerId = subject_student_mapping.customerId
  INNER JOIN subjects ON subject_student_mapping.subjectId = subjects.subjectId
GROUP BY
  customers.customerId, customers.name;
