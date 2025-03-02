# Enterprise CRM System

A robust CRM system built with Node.js that handles bulk operations, file processing, and rate limiting. The system is designed to process large datasets efficiently while maintaining system stability through rate limiting and job queuing.

## Data Models

The system is built around five core models that handle different aspects of the data processing pipeline:

### 1. File Model
- Stores metadata about the uploaded file
- Links to associated actions and chunks

### 2. Action Model
- Defines the bulk operations to be performed
- Contains processing rules and mappings
- Tracks overall action status and progress
- Links to file and chunk entities

### 3. FileChunk Model
- Represents segments of the original file (1000 rows each)
- Enables concurrent processing
- Tracks processing status of individual chunks

### 4. ChunkEntity Model
- Maps chunks to specific actions/entities
- Tracks processing status per entity
- Enables granular error handling
- Links chunks with their respective actions

### 5. ContactEntity Model
- Currently the only supported entity type
- Stores contact information and attributes
- Target entity for create/update operations
- Extensible design for future entity types

## System Architecture

### High Level Design
![High Level Design](https://crm-assignment.s3.ap-south-1.amazonaws.com/crm_hld.drawio.png)

### Use Case Diagram
![Use Case Diagram](https://crm-assignment.s3.ap-south-1.amazonaws.com/crm_usecase.drawio.png)

## Assumptions & Design Decisions

### File Processing
- The system expects pre-processed file metadata (URL, row count, column count)
- File parsing and metadata extraction is assumed to be handled by:
  - Frontend service
  - Separate pre-processing service
- This design choice avoids real-time CSV parsing during rate limiting checks
- Enables more accurate and efficient rate limiting based on actual row counts

### Data Storage & Processing
- NoSQL (MongoDB) chosen for:
  - Flexible schema design
  - Better handling of varying data structures
  - Horizontal scalability
- Redis + Bull Queue implementation:
  - Currently in-memory storage for performance
  - Can be configured for persistence (AOF) based on requirements
  - Default 3 retry attempts for failed chunks
  - Automatic job cleanup after completion/failure
- Chunk-based processing:
  - Files broken into 1000-row chunks
  - Enables parallel processing
  - Better error isolation and retry management

## Features

### 1. Bulk Operations
- Support for multiple actions in a single request
- CSV file processing capabilities
- Configurable processing delays (0-10080 minutes)
- Batch processing with Bull Queue (Currently in memory can be developed with AOF as well)
- Job deduplication to prevent duplicate processing

### 2. Rate Limiting
- Token bucket algorithm implementation
- Redis-based rate limiting
- Lua script optimization for atomic operations and avoiding race conditions
- Default rate: 10,000 requests per minute per account

### 3. File Processing
- Support for CSV files
- Breaking down a file into chunks of 1000 rows each
- Concurrent processing of chunks for scalability and performance enhancement
- Currently supports a single file across entities

### 4. Action Management
- Supports multiple action types:
  - create_and_update
  - create
  - update
- Flexible identifier system
- Custom field mapping
- Progress tracking
- Status monitoring (queued, ongoing, done, failed)

## Technical Stack

- **Node.js**: Core runtime
- **MongoDB**: Primary database (via Mongoose)
- **Redis**: Rate limiting and job queue
- **Bull**: Job queue management
- **Sails.js**: Web framework

## Setup

1. **Prerequisites**
   ```bash
   - Node.js ^18.0.0
   - Redis
   - MongoDB
   ```

2. **Installation**
   ```bash
   npm install
   ```

3. **Environment Variables**
   ```
   # NOT REQUIRED AS OF NOW
   ```
4. **Datastore**
  ```
  # Make sure to update datastore.js file with your credentials
  ```

## API Documentation

For detailed API testing and examples, you can use our Postman collection:
[![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/crimson-star-8222/crm-processing/collection/9z0uncp/api-documentation-reference?action=share&creator=4788957&active-environment=4788957-b3575859-b61d-47cf-893e-2b72e726641e)

## Rate Limiting

The system implements a token bucket algorithm with the following default configuration:
- Bucket Size: 10,000 tokens
- Refill Interval: 60 seconds
- Per-account rate limiting
- Atomic operations using Redis Lua scripts

## Error Handling

- Rate limit exceeded: 429 Too Many Requests
- Invalid input: 400 Bad Request
- Server errors: 500 Internal Server Error

## Best Practices

1. **File Processing**
   - Keep files under 10,000 rows for optimal processing
   - Ensure CSV columns match the defined matches in actions

2. **Rate Limiting**
   - Monitor rate limit usage through response headers
   - Implement exponential backoff in clients

3. **Bulk Operations**
   - Group related actions together
   - Use appropriate processing delays for large datasets
   - Monitor job status through the provided endpoints

