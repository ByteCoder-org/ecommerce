# Working with Liquibase in the Product Microservice

## Introduction

This guide explains how to use Liquibase for database migrations in the product microservice. Liquibase helps manage and track database schema changes over time, making it easier to evolve your database schema as your application grows.

## How Liquibase Works in Our Application

1. **Configuration**: Liquibase is configured in `application.yml` with a master changelog file.
2. **Changelog Files**: Changes are organized in XML files in the `src/main/resources/db/changelog` directory.
3. **Change Sets**: Each change to the database schema is defined in a changeset with a unique ID and author.

## Project Structure

```
src/main/resources/
└── db/
    └── changelog/
        ├── db.changelog-master.yaml (master file that includes all change files)
        └── changes/
            ├── 001-initial-schema.xml (creates the products table)
            ├── 002-add-product-image-url.xml (adds the image_url column)
            └── ... (future changes)
```

## How to Add a New Database Migration

When you need to make a change to the database schema (like adding a new column), follow these steps:

1. **Create a new changelog file** in the `src/main/resources/db/changelog/changes` directory with a descriptive name and incremental number (e.g., `003-add-product-rating.xml`).

2. **Define the change** using Liquibase XML syntax. For example, to add a new column:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
        xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                      http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.20.xsd">

    <changeSet id="003" author="your-name">
        <comment>Add rating column to products table</comment>
        <addColumn tableName="products">
            <column name="rating" type="numeric(3, 2)"/>
        </addColumn>
    </changeSet>

</databaseChangeLog>
```

3. **Include the new file** in the master changelog file (`db.changelog-master.yaml`):

```yaml
databaseChangeLog:
  - include:
      file: db/changelog/changes/003-add-product-rating.xml
```

4. **Update your entity class** to include the new field:

```java
@Column(name = "rating")
private BigDecimal rating;
```

5. **Update your DTOs** (ProductRequest and ProductResponse) to include the new field.

6. **Update your service methods** to handle the new field.

7. **Restart your application**. Liquibase will automatically apply the new change to the database.

## Common Liquibase Operations

### Adding a Column

```xml
<changeSet id="add-column-example" author="developer">
    <addColumn tableName="your_table">
        <column name="new_column" type="varchar(255)">
            <constraints nullable="true"/>
        </column>
    </addColumn>
</changeSet>
```

### Modifying a Column

```xml
<changeSet id="modify-column-example" author="developer">
    <modifyDataType tableName="your_table" columnName="your_column" newDataType="text"/>
</changeSet>
```

### Adding Constraints

```xml
<changeSet id="add-constraint-example" author="developer">
    <addNotNullConstraint tableName="your_table" columnName="your_column" columnDataType="varchar(255)"/>
</changeSet>
```

### Adding an Index

```xml
<changeSet id="add-index-example" author="developer">
    <createIndex indexName="idx_your_column" tableName="your_table">
        <column name="your_column"/>
    </createIndex>
</changeSet>
```

## Best Practices

1. **Never modify an existing changeset** once it has been applied to any environment.
2. **Use descriptive names** for your changelog files and changesets.
3. **Include a comment** in each changeset explaining the purpose of the change.
4. **Keep changesets small and focused** on a single logical change.
5. **Test migrations** in a development environment before applying them to production.
6. **Include rollback instructions** when possible to allow reverting changes if needed.

## Verifying Migrations

Liquibase creates and maintains a table called `DATABASECHANGELOG` in your database to track which changesets have been applied. You can query this table to see the history of database changes:

```sql
SELECT id, author, filename, dateexecuted, orderexecuted, exectype
FROM databasechangelog
ORDER BY orderexecuted;
```

This will show you all the changesets that have been applied to your database, when they were applied, and in what order.