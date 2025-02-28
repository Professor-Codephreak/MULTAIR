Multipart Upload Layer Transfer Architecture for Intelligent Routing
MULTAIR (c) 2025 Gregory L. Magnusson

Based on original works:
Multer (c) 2014-2021 Hage Yaapa <yaapa@live.com>
Busboy (c) 2010 Benjamin Thomas

MIT License
---

## Multair Storage Engines

Multair provides a flexible and extensible storage engine system that allows you to control how and where uploaded files are stored. Storage engines are pluggable modules that handle the low-level details of file persistence.

Multair offers several built-in storage engines to cover common use cases, and you can also create custom storage engines to integrate with any storage backend you require.

### Built-in Storage Engines

Multair includes these built-in storage engines:

*   **[Disk Storage Engine](./diskstorage.md)**:  The recommended engine for most production environments. Stores files on the local file system, offering configurable destination directories and filename generation. Provides robust and efficient disk-based storage.

*   **[Memory Storage Engine](./memory.md)**:  Stores files directly in memory as `Buffer` objects. Suitable for in-memory processing of smaller files and temporary file handling. **Use with caution in production due to memory limitations.**

*   **[TCP Server Storage Engine](./tcpserver.md)**: A demonstration engine that streams file data to a remote TCP server. Illustrates network-based storage and custom protocol integration possibilities. **Not production-ready and requires a separate TCP server.**

### Choosing a Storage Engine

The best storage engine for your application depends on your specific requirements:

*   **For most production web applications requiring persistent and reliable file storage, `diskStorage` is the recommended choice.**
*   Use `memoryStorage` only for specific scenarios like in-memory processing of small files or temporary file handling, and be very mindful of memory usage implications.
*   `tcpserverStorage` is primarily for demonstration and experimental purposes to explore network-based file handling. It is not intended for direct production use without significant customization and security enhancements.

### Custom Storage Engines

Multair's architecture allows you to create your own custom storage engines to integrate with any storage backend, such as:

*   Cloud storage services (Amazon S3, Azure Blob Storage, Google Cloud Storage)
*   Databases (storing file data directly in a database)
*   Network-attached storage (NAS)
*   Content Delivery Networks (CDNs)
*   Any other custom storage solution

Documentation and examples for creating custom storage engines will be provided in a future update. The `tcpserverStorage` engine serves as a good starting point for understanding the basic structure of a custom storage engine.
