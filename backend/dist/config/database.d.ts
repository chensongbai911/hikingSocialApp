import mysql from 'mysql2/promise';
export declare const pool: mysql.Pool;
/**
 * 测试数据库连接
 */
export declare function testConnection(): Promise<boolean>;
/**
 * 关闭连接池
 */
export declare function closePool(): Promise<void>;
//# sourceMappingURL=database.d.ts.map