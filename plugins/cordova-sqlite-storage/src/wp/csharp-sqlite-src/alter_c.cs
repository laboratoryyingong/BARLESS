using System;
using System.Diagnostics;
using System.Text;

namespace Community.CsharpSqlite
{
  using sqlite3_value = Sqlite3.Mem;

  public partial class Sqlite3
  {
/*
** 2005 February 15
**
** The author disclaims copyright to this source code.  In place of
** a legal notice, here is a blessing:
**
**    May you do good and not evil.
**    May you find forgiveness for yourself and forgive others.
**    May you share freely, never taking more than you give.
**
*************************************************************************
** This file contains C code routines that used to generate VDBE code
** that implements the ALTER TABLE command.
*************************************************************************
**  Included in SQLite3 port to C#-SQLite;  2008 Noah B Hart
**  C#-SQLite is an independent reimplementation of the SQLite software library
**
**  SQLITE_SOURCE_ID: 2011-06-23 19:49:22 4374b7e83ea0a3fbc3691f9c0c936272862f32f2
**
*************************************************************************
*/
//#include "sqliteInt.h"

/*
** The code in this file only exists if we are not omitting the
** ALTER TABLE logic from the build.
*/
#if !SQLITE_OMIT_ALTERTABLE


/*
** This function is used by SQL generated to implement the
** ALTER TABLE command. The first argument is the text of a CREATE TABLE or
** CREATE INDEX command. The second is a table name. The table name in
** the CREATE TABLE or CREATE INDEX statement is replaced with the third
** argument and the result returned. Examples:
**
** sqlite_rename_table('CREATE TABLE abc(a, b, c)', 'def')
**     . 'CREATE TABLE def(a, b, c)'
**
** sqlite_rename_table('CREATE INDEX i ON abc(a)', 'def')
**     . 'CREATE INDEX i ON def(a, b, c)'
*/
static void renameTableFunc(
sqlite3_context context,
int NotUsed,
sqlite3_value[] argv
)
{
  string bResult = sqlite3_value_text( argv[0] );
  string zSql = bResult == null ? "" : bResult;
  string zTableName = sqlite3_value_text( argv[1] );

  int token = 0;
  Token tname = new Token();
  int zCsr = 0;
  int zLoc = 0;
  int len = 0;
  string zRet;

  sqlite3 db = sqlite3_context_db_handle( context );

  UNUSED_PARAMETER( NotUsed );

  /* The principle used to locate the table name in the CREATE TABLE
  ** statement is that the table name is the first non-space token that
  ** is immediately followed by a TK_LP or TK_USING token.
  */
  if ( zSql != "" )
  {
    do
    {
      if ( zCsr == zSql.Length )
      {
        /* Ran out of input before finding an opening bracket. Return NULL. */
        return;
      }

      /* Store the token that zCsr points to in tname. */
      zLoc = zCsr;
      tname.z = zSql.Substring( zCsr );//(char*)zCsr;
      tname.n = len;

      /* Advance zCsr to the next token. Store that token type in 'token',
      ** and its length in 'len' (to be used next iteration of this loop).
      */
      do
      {
        zCsr += len;
        len = ( zCsr == zSql.Length ) ? 1 : sqlite3GetToken( zSql, zCsr, ref token );
      } while ( token == TK_SPACE );
      Debug.Assert( len > 0 );
    } while ( token != TK_LP && token != TK_USING );

    zRet = sqlite3MPrintf( db, "%.*s\"%w\"%s", zLoc, zSql.Substring( 0, zLoc ),
    zTableName, zSql.Substring( zLoc + tname.n ) );

    sqlite3_result_text( context, zRet, -1, SQLITE_DYNAMIC );
  }
}

/*
** This C function implements an SQL user function that is used by SQL code
** generated by the ALTER TABLE ... RENAME command to modify the definition
** of any foreign key constraints that use the table being renamed as the
** parent table. It is passed three arguments:
**
**   1) The complete text of the CREATE TABLE statement being modified,
**   2) The old name of the table being renamed, and
**   3) The new name of the table being renamed.
**
** It returns the new CREATE TABLE statement. For example:
**
**   sqlite_rename_parent('CREATE TABLE t1(a REFERENCES t2)', 't2', 't3')
**       -> 'CREATE TABLE t1(a REFERENCES t3)'
*/
#if !SQLITE_OMIT_FOREIGN_KEY
static void renameParentFunc(
  sqlite3_context context,
  int NotUsed,
  sqlite3_value[] argv
)
{
  sqlite3 db = sqlite3_context_db_handle( context );
  string zOutput = "";
  string zResult;
  string zInput = sqlite3_value_text( argv[0] );
  string zOld = sqlite3_value_text( argv[1] );
  string zNew = sqlite3_value_text( argv[2] );

  int zIdx;         /* Pointer to token */
  int zLeft = 0;    /* Pointer to remainder of String */
  int n = 0;        /* Length of token z */
  int token = 0;    /* Type of token */

  UNUSED_PARAMETER( NotUsed );
  for ( zIdx = 0; zIdx < zInput.Length; zIdx += n )//z=zInput; *z; z=z+n)
  {
    n = sqlite3GetToken( zInput, zIdx, ref token );
    if ( token == TK_REFERENCES )
    {
      string zParent;
      do
      {
        zIdx += n;
        n = sqlite3GetToken( zInput, zIdx, ref token );
      } while ( token == TK_SPACE );

      zParent = zIdx + n < zInput.Length ? zInput.Substring( zIdx, n ) : "";//sqlite3DbStrNDup(db, zIdx, n);
      if ( String.IsNullOrEmpty( zParent ) )
        break;
      sqlite3Dequote( ref zParent );
      if ( zOld.Equals( zParent, StringComparison.InvariantCultureIgnoreCase ) )
      {
        string zOut = sqlite3MPrintf( db, "%s%.*s\"%w\"",
            zOutput, zIdx - zLeft, zInput.Substring( zLeft ), zNew
        );
        sqlite3DbFree( db, ref zOutput );
        zOutput = zOut;
        zIdx += n;// zInput = &z[n];
        zLeft = zIdx;
      }
      sqlite3DbFree( db, ref zParent );
    }
  }

  zResult = sqlite3MPrintf( db, "%s%s", zOutput, zInput.Substring( zLeft ) );
  sqlite3_result_text( context, zResult, -1, SQLITE_DYNAMIC );
  sqlite3DbFree( db, ref zOutput );
}
#endif

#if !SQLITE_OMIT_TRIGGER
/* This function is used by SQL generated to implement the
** ALTER TABLE command. The first argument is the text of a CREATE TRIGGER
** statement. The second is a table name. The table name in the CREATE
** TRIGGER statement is replaced with the third argument and the result
** returned. This is analagous to renameTableFunc() above, except for CREATE
** TRIGGER, not CREATE INDEX and CREATE TABLE.
*/
static void renameTriggerFunc(
sqlite3_context context,
int NotUsed,
sqlite3_value[] argv
)
{
  string zSql = sqlite3_value_text( argv[0] );
  string zTableName = sqlite3_value_text( argv[1] );

  int token = 0;
  Token tname = new Token();
  int dist = 3;
  int zCsr = 0;
  int zLoc = 0;
  int len = 1;
  string zRet;

  sqlite3 db = sqlite3_context_db_handle( context );

  UNUSED_PARAMETER( NotUsed );

  /* The principle used to locate the table name in the CREATE TRIGGER
  ** statement is that the table name is the first token that is immediatedly
  ** preceded by either TK_ON or TK_DOT and immediatedly followed by one
  ** of TK_WHEN, TK_BEGIN or TK_FOR.
  */
  if ( zSql != null )
  {
    do
    {

      if ( zCsr == zSql.Length )
      {
        /* Ran out of input before finding the table name. Return NULL. */
        return;
      }

      /* Store the token that zCsr points to in tname. */
      zLoc = zCsr;
      tname.z = zSql.Substring( zCsr, len );//(char*)zCsr;
      tname.n = len;

      /* Advance zCsr to the next token. Store that token type in 'token',
      ** and its length in 'len' (to be used next iteration of this loop).
      */
      do
      {
        zCsr += len;
        len = ( zCsr == zSql.Length ) ? 1 : sqlite3GetToken( zSql, zCsr, ref token );
      } while ( token == TK_SPACE );
      Debug.Assert( len > 0 );

      /* Variable 'dist' stores the number of tokens read since the most
      ** recent TK_DOT or TK_ON. This means that when a WHEN, FOR or BEGIN
      ** token is read and 'dist' equals 2, the condition stated above
      ** to be met.
      **
      ** Note that ON cannot be a database, table or column name, so
      ** there is no need to worry about syntax like
      ** "CREATE TRIGGER ... ON ON.ON BEGIN ..." etc.
      */
      dist++;
      if ( token == TK_DOT || token == TK_ON )
      {
        dist = 0;
      }
    } while ( dist != 2 || ( token != TK_WHEN && token != TK_FOR && token != TK_BEGIN ) );

    /* Variable tname now contains the token that is the old table-name
    ** in the CREATE TRIGGER statement.
    */
    zRet = sqlite3MPrintf( db, "%.*s\"%w\"%s", zLoc, zSql.Substring( 0, zLoc ),
    zTableName, zSql.Substring( zLoc + tname.n ) );
    sqlite3_result_text( context, zRet, -1, SQLITE_DYNAMIC );
  }
}
#endif // * !SQLITE_OMIT_TRIGGER */

/*
** Register built-in functions used to help implement ALTER TABLE
*/
static FuncDef[] aAlterTableFuncs;
static void sqlite3AlterFunctions()
{
  aAlterTableFuncs = new FuncDef[] {
FUNCTION("sqlite_rename_table",   2, 0, 0, renameTableFunc),
#if !SQLITE_OMIT_TRIGGER
FUNCTION("sqlite_rename_trigger", 2, 0, 0, renameTriggerFunc),
#endif
#if !SQLITE_OMIT_FOREIGN_KEY
FUNCTION("sqlite_rename_parent",  3, 0, 0, renameParentFunc),
#endif
  };
  int i;
#if SQLITE_OMIT_WSD
  FuncDefHash pHash = GLOBAL(FuncDefHash, sqlite3GlobalFunctions);
  FuncDef[] aFunc = GLOBAL(FuncDef, aAlterTableFuncs);
#else
  FuncDefHash pHash = sqlite3GlobalFunctions;
  FuncDef[] aFunc = aAlterTableFuncs;
#endif

  for ( i = 0; i < ArraySize( aAlterTableFuncs ); i++ )
  {
    sqlite3FuncDefInsert( pHash, aFunc[i] );
  }
}

/*
** This function is used to create the text of expressions of the form:
**
**   name=<constant1> OR name=<constant2> OR ...
**
** If argument zWhere is NULL, then a pointer string containing the text
** "name=<constant>" is returned, where <constant> is the quoted version
** of the string passed as argument zConstant. The returned buffer is
** allocated using sqlite3DbMalloc(). It is the responsibility of the
** caller to ensure that it is eventually freed.
**
** If argument zWhere is not NULL, then the string returned is
** "<where> OR name=<constant>", where <where> is the contents of zWhere.
** In this case zWhere is passed to sqlite3DbFree() before returning.
**
*/
static string whereOrName( sqlite3 db, string zWhere, string zConstant )
{
  string zNew;
  if ( String.IsNullOrEmpty( zWhere ) )
  {
    zNew = sqlite3MPrintf( db, "name=%Q", zConstant );
  }
  else
  {
    zNew = sqlite3MPrintf( db, "%s OR name=%Q", zWhere, zConstant );
    sqlite3DbFree( db, ref zWhere );
  }
  return zNew;
}

#if !(SQLITE_OMIT_FOREIGN_KEY) && !(SQLITE_OMIT_TRIGGER)
/*
** Generate the text of a WHERE expression which can be used to select all
** tables that have foreign key constraints that refer to table pTab (i.e.
** constraints for which pTab is the parent table) from the sqlite_master
** table.
*/
static string whereForeignKeys( Parse pParse, Table pTab )
{
  FKey p;
  string zWhere = "";
  for ( p = sqlite3FkReferences( pTab ); p != null; p = p.pNextTo )
  {
    zWhere = whereOrName( pParse.db, zWhere, p.pFrom.zName );
  }
  return zWhere;
}
#endif

/*
** Generate the text of a WHERE expression which can be used to select all
** temporary triggers on table pTab from the sqlite_temp_master table. If
** table pTab has no temporary triggers, or is itself stored in the
** temporary database, NULL is returned.
*/
static string whereTempTriggers( Parse pParse, Table pTab )
{
  Trigger pTrig;
  string zWhere = "";
  Schema pTempSchema = pParse.db.aDb[1].pSchema; /* Temp db schema */

  /* If the table is not located in the temp.db (in which case NULL is
  ** returned, loop through the tables list of triggers. For each trigger
  ** that is not part of the temp.db schema, add a clause to the WHERE
  ** expression being built up in zWhere.
  */
  if ( pTab.pSchema != pTempSchema )
  {
    sqlite3 db = pParse.db;
    for ( pTrig = sqlite3TriggerList( pParse, pTab ); pTrig != null; pTrig = pTrig.pNext )
    {
      if ( pTrig.pSchema == pTempSchema )
      {
        zWhere = whereOrName( db, zWhere, pTrig.zName );
      }
    }
  }
  if ( !String.IsNullOrEmpty( zWhere ) )
  {
    zWhere = sqlite3MPrintf( pParse.db, "type='trigger' AND (%s)", zWhere );
    //sqlite3DbFree( pParse.db, ref zWhere );
    //zWhere = zNew;
  }
  return zWhere;
}

/*
** Generate code to drop and reload the internal representation of table
** pTab from the database, including triggers and temporary triggers.
** Argument zName is the name of the table in the database schema at
** the time the generated code is executed. This can be different from
** pTab.zName if this function is being called to code part of an
** "ALTER TABLE RENAME TO" statement.
*/
static void reloadTableSchema( Parse pParse, Table pTab, string zName )
{
  Vdbe v;
  string zWhere;
  int iDb;                   /* Index of database containing pTab */
#if !SQLITE_OMIT_TRIGGER
  Trigger pTrig;
#endif

  v = sqlite3GetVdbe( pParse );
  if ( NEVER( v == null ) )
    return;
  Debug.Assert( sqlite3BtreeHoldsAllMutexes( pParse.db ) );
  iDb = sqlite3SchemaToIndex( pParse.db, pTab.pSchema );
  Debug.Assert( iDb >= 0 );

#if !SQLITE_OMIT_TRIGGER
  /* Drop any table triggers from the internal schema. */
  for ( pTrig = sqlite3TriggerList( pParse, pTab ); pTrig != null; pTrig = pTrig.pNext )
  {
    int iTrigDb = sqlite3SchemaToIndex( pParse.db, pTrig.pSchema );
    Debug.Assert( iTrigDb == iDb || iTrigDb == 1 );
    sqlite3VdbeAddOp4( v, OP_DropTrigger, iTrigDb, 0, 0, pTrig.zName, 0 );
  }
#endif

  /* Drop the table and index from the internal schema. */
  sqlite3VdbeAddOp4( v, OP_DropTable, iDb, 0, 0, pTab.zName, 0 );

  /* Reload the table, index and permanent trigger schemas. */
  zWhere = sqlite3MPrintf( pParse.db, "tbl_name=%Q", zName );
  if ( zWhere == null )
    return;
  sqlite3VdbeAddParseSchemaOp( v, iDb, zWhere );

#if !SQLITE_OMIT_TRIGGER
  /* Now, if the table is not stored in the temp database, reload any temp
** triggers. Don't use IN(...) in case SQLITE_OMIT_SUBQUERY is defined.
*/
  if ( ( zWhere = whereTempTriggers( pParse, pTab ) ) != "" )
  {
    sqlite3VdbeAddParseSchemaOp( v, 1, zWhere );
  }
#endif
}

/*
** Parameter zName is the name of a table that is about to be altered
** (either with ALTER TABLE ... RENAME TO or ALTER TABLE ... ADD COLUMN).
** If the table is a system table, this function leaves an error message
** in pParse->zErr (system tables may not be altered) and returns non-zero.
**
** Or, if zName is not a system table, zero is returned.
*/
static int isSystemTable( Parse pParse, string zName )
{
  if ( zName.StartsWith( "sqlite_", System.StringComparison.InvariantCultureIgnoreCase ) )
  {
    sqlite3ErrorMsg( pParse, "table %s may not be altered", zName );
    return 1;
  }
  return 0;
}

/*
** Generate code to implement the "ALTER TABLE xxx RENAME TO yyy"
** command.
*/
static void sqlite3AlterRenameTable(
Parse pParse,             /* Parser context. */
SrcList pSrc,             /* The table to rename. */
Token pName               /* The new table name. */
)
{
  int iDb;                  /* Database that contains the table */
  string zDb;               /* Name of database iDb */
  Table pTab;               /* Table being renamed */
  string zName = null;      /* NULL-terminated version of pName */
  sqlite3 db = pParse.db;   /* Database connection */
  int nTabName;             /* Number of UTF-8 characters in zTabName */
  string zTabName;          /* Original name of the table */
  Vdbe v;
#if !SQLITE_OMIT_TRIGGER
  string zWhere = "";       /* Where clause to locate temp triggers */
#endif
  VTable pVTab = null;      /* Non-zero if this is a v-tab with an xRename() */
  int savedDbFlags;         /* Saved value of db->flags */

  savedDbFlags = db.flags;

  //if ( NEVER( db.mallocFailed != 0 ) ) goto exit_rename_table;
  Debug.Assert( pSrc.nSrc == 1 );
  Debug.Assert( sqlite3BtreeHoldsAllMutexes( pParse.db ) );
  pTab = sqlite3LocateTable( pParse, 0, pSrc.a[0].zName, pSrc.a[0].zDatabase );
  if ( pTab == null )
    goto exit_rename_table;
  iDb = sqlite3SchemaToIndex( pParse.db, pTab.pSchema );
  zDb = db.aDb[iDb].zName;
  db.flags |= SQLITE_PreferBuiltin;

  /* Get a NULL terminated version of the new table name. */
  zName = sqlite3NameFromToken( db, pName );
  if ( zName == null )
    goto exit_rename_table;

  /* Check that a table or index named 'zName' does not already exist
  ** in database iDb. If so, this is an error.
  */
  if ( sqlite3FindTable( db, zName, zDb ) != null || sqlite3FindIndex( db, zName, zDb ) != null )
  {
    sqlite3ErrorMsg( pParse,
    "there is already another table or index with this name: %s", zName );
    goto exit_rename_table;
  }

  /* Make sure it is not a system table being altered, or a reserved name
  ** that the table is being renamed to.
  */
  if ( SQLITE_OK!=isSystemTable(pParse, pTab.zName) )
  {
    goto exit_rename_table;
  }
  if ( SQLITE_OK != sqlite3CheckObjectName( pParse, zName ) )
  {
    goto exit_rename_table;
  }

#if !SQLITE_OMIT_VIEW
  if ( pTab.pSelect != null )
  {
    sqlite3ErrorMsg( pParse, "view %s may not be altered", pTab.zName );
    goto exit_rename_table;
  }
#endif

#if NO_SQLITE_OMIT_AUTHORIZATION //#if !SQLITE_OMIT_AUTHORIZATION
/* Invoke the authorization callback. */
if( sqlite3AuthCheck(pParse, SQLITE_ALTER_TABLE, zDb, pTab.zName, 0) ){
goto exit_rename_table;
}
#endif

  if ( sqlite3ViewGetColumnNames( pParse, pTab ) != 0 )
  {
    goto exit_rename_table;
  }
#if !SQLITE_OMIT_VIRTUALTABLE
  if ( IsVirtual( pTab ) )
  {
    pVTab = sqlite3GetVTable( db, pTab );
    if ( pVTab.pVtab.pModule.xRename == null )
    {
      pVTab = null;
    }
  }
#endif
  /* Begin a transaction and code the VerifyCookie for database iDb.
** Then modify the schema cookie (since the ALTER TABLE modifies the
** schema). Open a statement transaction if the table is a virtual
** table.
*/
  v = sqlite3GetVdbe( pParse );
  if ( v == null )
  {
    goto exit_rename_table;
  }
  sqlite3BeginWriteOperation( pParse, pVTab != null ? 1 : 0, iDb );
  sqlite3ChangeCookie( pParse, iDb );

  /* If this is a virtual table, invoke the xRename() function if
  ** one is defined. The xRename() callback will modify the names
  ** of any resources used by the v-table implementation (including other
  ** SQLite tables) that are identified by the name of the virtual table.
  */
#if  !SQLITE_OMIT_VIRTUALTABLE
if ( pVTab !=null)
{
int i = ++pParse.nMem;
sqlite3VdbeAddOp4( v, OP_String8, 0, i, 0, zName, 0 );
sqlite3VdbeAddOp4( v, OP_VRename, i, 0, 0, pVTab, P4_VTAB );
sqlite3MayAbort(pParse);
}
#endif

  /* figure out how many UTF-8 characters are in zName */
  zTabName = pTab.zName;
  nTabName = sqlite3Utf8CharLen( zTabName, -1 );

#if !(SQLITE_OMIT_FOREIGN_KEY) && !(SQLITE_OMIT_TRIGGER)
  if ( ( db.flags & SQLITE_ForeignKeys ) != 0 )
  {
    /* If foreign-key support is enabled, rewrite the CREATE TABLE
    ** statements corresponding to all child tables of foreign key constraints
    ** for which the renamed table is the parent table.  */
    if ( ( zWhere = whereForeignKeys( pParse, pTab ) ) != null )
    {
      sqlite3NestedParse( pParse,
          "UPDATE \"%w\".%s SET " +
              "sql = sqlite_rename_parent(sql, %Q, %Q) " +
              "WHERE %s;", zDb, SCHEMA_TABLE( iDb ), zTabName, zName, zWhere );
      sqlite3DbFree( db, ref zWhere );
    }
  }
#endif

  /* Modify the sqlite_master table to use the new table name. */
  sqlite3NestedParse( pParse,
  "UPDATE %Q.%s SET " +
#if SQLITE_OMIT_TRIGGER
 "sql = sqlite_rename_table(sql, %Q), " +
#else
 "sql = CASE " +
  "WHEN type = 'trigger' THEN sqlite_rename_trigger(sql, %Q)" +
  "ELSE sqlite_rename_table(sql, %Q) END, " +
#endif
 "tbl_name = %Q, " +
  "name = CASE " +
  "WHEN type='table' THEN %Q " +
  "WHEN name LIKE 'sqlite_autoindex%%' AND type='index' THEN " +
  "'sqlite_autoindex_' || %Q || substr(name,%d+18) " +
  "ELSE name END " +
  "WHERE tbl_name=%Q AND " +
  "(type='table' OR type='index' OR type='trigger');",
  zDb, SCHEMA_TABLE( iDb ), zName, zName, zName,
#if !SQLITE_OMIT_TRIGGER
 zName,
#endif
 zName, nTabName, zTabName
  );

#if !SQLITE_OMIT_AUTOINCREMENT
  /* If the sqlite_sequence table exists in this database, then update
** it with the new table name.
*/
  if ( sqlite3FindTable( db, "sqlite_sequence", zDb ) != null )
  {
    sqlite3NestedParse( pParse,
    "UPDATE \"%w\".sqlite_sequence set name = %Q WHERE name = %Q",
    zDb, zName, pTab.zName
    );
  }
#endif

#if !SQLITE_OMIT_TRIGGER
  /* If there are TEMP triggers on this table, modify the sqlite_temp_master
** table. Don't do this if the table being ALTERed is itself located in
** the temp database.
*/
  if ( ( zWhere = whereTempTriggers( pParse, pTab ) ) != "" )
  {
    sqlite3NestedParse( pParse,
    "UPDATE sqlite_temp_master SET " +
    "sql = sqlite_rename_trigger(sql, %Q), " +
    "tbl_name = %Q " +
    "WHERE %s;", zName, zName, zWhere );
    sqlite3DbFree( db, ref zWhere );
  }
#endif

#if !(SQLITE_OMIT_FOREIGN_KEY) && !(SQLITE_OMIT_TRIGGER)
  if ( ( db.flags & SQLITE_ForeignKeys ) != 0 )
  {
    FKey p;
    for ( p = sqlite3FkReferences( pTab ); p != null; p = p.pNextTo )
    {
      Table pFrom = p.pFrom;
      if ( pFrom != pTab )
      {
        reloadTableSchema( pParse, p.pFrom, pFrom.zName );
      }
    }
  }
#endif

  /* Drop and reload the internal table schema. */
  reloadTableSchema( pParse, pTab, zName );

exit_rename_table:
  sqlite3SrcListDelete( db, ref pSrc );
  sqlite3DbFree( db, ref zName );
  db.flags = savedDbFlags;
}

/*
** Generate code to make sure the file format number is at least minFormat.
** The generated code will increase the file format number if necessary.
*/
static void sqlite3MinimumFileFormat( Parse pParse, int iDb, int minFormat )
{
  Vdbe v;
  v = sqlite3GetVdbe( pParse );
  /* The VDBE should have been allocated before this routine is called.
  ** If that allocation failed, we would have quit before reaching this
  ** point */
  if ( ALWAYS( v ) )
  {
    int r1 = sqlite3GetTempReg( pParse );
    int r2 = sqlite3GetTempReg( pParse );
    int j1;
    sqlite3VdbeAddOp3( v, OP_ReadCookie, iDb, r1, BTREE_FILE_FORMAT );
    sqlite3VdbeUsesBtree( v, iDb );
    sqlite3VdbeAddOp2( v, OP_Integer, minFormat, r2 );
    j1 = sqlite3VdbeAddOp3( v, OP_Ge, r2, 0, r1 );
    sqlite3VdbeAddOp3( v, OP_SetCookie, iDb, BTREE_FILE_FORMAT, r2 );
    sqlite3VdbeJumpHere( v, j1 );
    sqlite3ReleaseTempReg( pParse, r1 );
    sqlite3ReleaseTempReg( pParse, r2 );
  }
}

/*
** This function is called after an "ALTER TABLE ... ADD" statement
** has been parsed. Argument pColDef contains the text of the new
** column definition.
**
** The Table structure pParse.pNewTable was extended to include
** the new column during parsing.
*/
static void sqlite3AlterFinishAddColumn( Parse pParse, Token pColDef )
{
  Table pNew;              /* Copy of pParse.pNewTable */
  Table pTab;              /* Table being altered */
  int iDb;                 /* Database number */
  string zDb;              /* Database name */
  string zTab;             /* Table name */
  string zCol;             /* Null-terminated column definition */
  Column pCol;             /* The new column */
  Expr pDflt;              /* Default value for the new column */
  sqlite3 db;              /* The database connection; */

  db = pParse.db;
  if ( pParse.nErr != 0 /*|| db.mallocFailed != 0 */ )
    return;
  pNew = pParse.pNewTable;
  Debug.Assert( pNew != null );
  Debug.Assert( sqlite3BtreeHoldsAllMutexes( db ) );
  iDb = sqlite3SchemaToIndex( db, pNew.pSchema );
  zDb = db.aDb[iDb].zName;
  zTab = pNew.zName.Substring( 16 );// zTab = &pNew->zName[16]; /* Skip the "sqlite_altertab_" prefix on the name */
  pCol = pNew.aCol[pNew.nCol - 1];
  pDflt = pCol.pDflt;
  pTab = sqlite3FindTable( db, zTab, zDb );
  Debug.Assert( pTab != null );

#if NO_SQLITE_OMIT_AUTHORIZATION //#if !SQLITE_OMIT_AUTHORIZATION
/* Invoke the authorization callback. */
if( sqlite3AuthCheck(pParse, SQLITE_ALTER_TABLE, zDb, pTab.zName, 0) ){
return;
}
#endif

  /* If the default value for the new column was specified with a
** literal NULL, then set pDflt to 0. This simplifies checking
** for an SQL NULL default below.
*/
  if ( pDflt != null && pDflt.op == TK_NULL )
  {
    pDflt = null;
  }

  /* Check that the new column is not specified as PRIMARY KEY or UNIQUE.
  ** If there is a NOT NULL constraint, then the default value for the
  ** column must not be NULL.
  */
  if ( pCol.isPrimKey != 0 )
  {
    sqlite3ErrorMsg( pParse, "Cannot add a PRIMARY KEY column" );
    return;
  }
  if ( pNew.pIndex != null )
  {
    sqlite3ErrorMsg( pParse, "Cannot add a UNIQUE column" );
    return;
  }
  if ( ( db.flags & SQLITE_ForeignKeys ) != 0 && pNew.pFKey != null && pDflt != null )
  {
    sqlite3ErrorMsg( pParse,
        "Cannot add a REFERENCES column with non-NULL default value" );
    return;
  }
  if ( pCol.notNull != 0 && pDflt == null )
  {
    sqlite3ErrorMsg( pParse,
    "Cannot add a NOT NULL column with default value NULL" );
    return;
  }

  /* Ensure the default expression is something that sqlite3ValueFromExpr()
  ** can handle (i.e. not CURRENT_TIME etc.)
  */
  if ( pDflt != null )
  {
    sqlite3_value pVal = null;
    if ( sqlite3ValueFromExpr( db, pDflt, SQLITE_UTF8, SQLITE_AFF_NONE, ref pVal ) != 0 )
    {
      //        db.mallocFailed = 1;
      return;
    }
    if ( pVal == null )
    {
      sqlite3ErrorMsg( pParse, "Cannot add a column with non-constant default" );
      return;
    }
    sqlite3ValueFree( ref pVal );
  }

  /* Modify the CREATE TABLE statement. */
  zCol = pColDef.z.Substring( 0, pColDef.n ).Replace( ";", " " ).Trim();//sqlite3DbStrNDup(db, (char*)pColDef.z, pColDef.n);
  if ( zCol != null )
  {
    //  char zEnd = zCol[pColDef.n-1];
    int savedDbFlags = db.flags;
    //      while( zEnd>zCol && (*zEnd==';' || sqlite3Isspace(*zEnd)) ){
    //    zEnd-- = '\0';
    //  }
    db.flags |= SQLITE_PreferBuiltin;
    sqlite3NestedParse( pParse,
    "UPDATE \"%w\".%s SET " +
    "sql = substr(sql,1,%d) || ', ' || %Q || substr(sql,%d) " +
    "WHERE type = 'table' AND name = %Q",
    zDb, SCHEMA_TABLE( iDb ), pNew.addColOffset, zCol, pNew.addColOffset + 1,
    zTab
    );
    sqlite3DbFree( db, ref zCol );
    db.flags = savedDbFlags;
  }

  /* If the default value of the new column is NULL, then set the file
  ** format to 2. If the default value of the new column is not NULL,
  ** the file format becomes 3.
  */
  sqlite3MinimumFileFormat( pParse, iDb, pDflt != null ? 3 : 2 );

  /* Reload the schema of the modified table. */
  reloadTableSchema( pParse, pTab, pTab.zName );
}

/*
** This function is called by the parser after the table-name in
** an "ALTER TABLE <table-name> ADD" statement is parsed. Argument
** pSrc is the full-name of the table being altered.
**
** This routine makes a (partial) copy of the Table structure
** for the table being altered and sets Parse.pNewTable to point
** to it. Routines called by the parser as the column definition
** is parsed (i.e. sqlite3AddColumn()) add the new Column data to
** the copy. The copy of the Table structure is deleted by tokenize.c
** after parsing is finished.
**
** Routine sqlite3AlterFinishAddColumn() will be called to complete
** coding the "ALTER TABLE ... ADD" statement.
*/
static void sqlite3AlterBeginAddColumn( Parse pParse, SrcList pSrc )
{
  Table pNew;
  Table pTab;
  Vdbe v;
  int iDb;
  int i;
  int nAlloc;
  sqlite3 db = pParse.db;

  /* Look up the table being altered. */
  Debug.Assert( pParse.pNewTable == null );
  Debug.Assert( sqlite3BtreeHoldsAllMutexes( db ) );
  //      if ( db.mallocFailed != 0 ) goto exit_begin_add_column;
  pTab = sqlite3LocateTable( pParse, 0, pSrc.a[0].zName, pSrc.a[0].zDatabase );
  if ( pTab == null )
    goto exit_begin_add_column;

  if ( IsVirtual( pTab ) )
  {
    sqlite3ErrorMsg( pParse, "virtual tables may not be altered" );
    goto exit_begin_add_column;
  }

  /* Make sure this is not an attempt to ALTER a view. */
  if ( pTab.pSelect != null )
  {
    sqlite3ErrorMsg( pParse, "Cannot add a column to a view" );
    goto exit_begin_add_column;
  }
  if ( SQLITE_OK != isSystemTable( pParse, pTab.zName ) )
  {
    goto exit_begin_add_column;
  }

  Debug.Assert( pTab.addColOffset > 0 );
  iDb = sqlite3SchemaToIndex( db, pTab.pSchema );

  /* Put a copy of the Table struct in Parse.pNewTable for the
  ** sqlite3AddColumn() function and friends to modify.  But modify
  ** the name by adding an "sqlite_altertab_" prefix.  By adding this
  ** prefix, we insure that the name will not collide with an existing
  ** table because user table are not allowed to have the "sqlite_"
  ** prefix on their name.
  */
  pNew = new Table();// (Table*)sqlite3DbMallocZero( db, sizeof(Table))
  if ( pNew == null )
    goto exit_begin_add_column;
  pParse.pNewTable = pNew;
  pNew.nRef = 1;
  pNew.nCol = pTab.nCol;
  Debug.Assert( pNew.nCol > 0 );
  nAlloc = ( ( ( pNew.nCol - 1 ) / 8 ) * 8 ) + 8;
  Debug.Assert( nAlloc >= pNew.nCol && nAlloc % 8 == 0 && nAlloc - pNew.nCol < 8 );
  pNew.aCol = new Column[nAlloc];// (Column*)sqlite3DbMallocZero( db, sizeof(Column) * nAlloc );
  pNew.zName = sqlite3MPrintf( db, "sqlite_altertab_%s", pTab.zName );
  if ( pNew.aCol == null || pNew.zName == null )
  {
    //        db.mallocFailed = 1;
    goto exit_begin_add_column;
  }
  // memcpy( pNew.aCol, pTab.aCol, sizeof(Column) * pNew.nCol );
  for ( i = 0; i < pNew.nCol; i++ )
  {
    Column pCol = pTab.aCol[i].Copy();
    // sqlite3DbStrDup( db, pCol.zName );
    pCol.zColl = null;
    pCol.zType = null;
    pCol.pDflt = null;
    pCol.zDflt = null;
    pNew.aCol[i] = pCol;
  }
  pNew.pSchema = db.aDb[iDb].pSchema;
  pNew.addColOffset = pTab.addColOffset;
  pNew.nRef = 1;

  /* Begin a transaction and increment the schema cookie.  */
  sqlite3BeginWriteOperation( pParse, 0, iDb );
  v = sqlite3GetVdbe( pParse );
  if ( v == null )
    goto exit_begin_add_column;
  sqlite3ChangeCookie( pParse, iDb );

exit_begin_add_column:
  sqlite3SrcListDelete( db, ref pSrc );
  return;
}
#endif  // * SQLITE_ALTER_TABLE */
  }
}
