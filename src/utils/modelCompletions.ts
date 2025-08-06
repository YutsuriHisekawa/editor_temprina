export const customModelCompletions = [
    {
        label: 'colfix',
        kind: 'function',
        detail: 'Fixes column configuration',
        insertText: 'colfix($1) {\n\t$0\n}',
    },
    {
        label: 'colsrc',
        kind: 'function',
        detail: 'Source column configuration',
        insertText: 'colsrc($1) {\n\t$0\n}',
    },
    {
        label: 'createAfter',
        kind: 'function',
        detail: 'Called after model creation',
        documentation: {
            value: [
                '```php',
                'public function createAfter($model, $arrayData, $metaData, $id=null)',
                '```',
                '',
                'Called after a model is created.',
                '',
                '@param mixed $model - The model instance',
                '@param array $arrayData - The data array',
                '@param array $metaData - Additional metadata',
                '@param int|null $id - Optional ID parameter'
            ].join('\n')
        },
        insertText: 'public function createAfter($model, $arrayData, $metaData, $id=null)\n{\n\t${0:// code here}\n}',
        sortText: '01'
    },
    {
        label: 'createAfterTransaction',
        kind: 'function',
        detail: 'Called after transaction completion',
        insertText: 'public function createAfterTransaction($newdata, $olddata, $data, $meta)\n{\n\t\n}',
    },
    {
        label: 'createBefore',
        kind: 'function',
        detail: 'Called before model creation',
        insertText: 'public function createBefore($model, $arrayData, $metaData, $id=null)\n{\n\t$newArrayData = array_merge($arrayData,[]);\n\treturn [\n\t\t"model" => $model,\n\t\t"data" => $newArrayData,\n\t\t// "errors" => [\'error1\']\n\t];\n}',
    },
    {
        label: 'createRoleCheck',
        kind: 'function',
        detail: 'Check role permissions for creation',
        insertText: 'public function createRoleCheck()\n{\n\t// config([ \'reason\' => \'Akses ditolak!\' ]);\n\treturn true;\n}',
    },
    {
        label: 'custom_exportexcel',
        kind: 'function',
        detail: 'Custom excel export handler',
        insertText: 'public function custom_exportexcel($request)\n{\n\t$query = \\DB::table($this->getTable())->get();\n\tif(count($query)==0){\n\t\treturn "data kosong";\n\t}else{\n\t\treturn \\Excel::download(new \\ExportExcel($query), \\Carbon::now()->format(\'d-m-Y\')."_".$this->getTable().\'.xlsx\');\n\t}\n}',
    },
    {
        label: 'custom_fileupload',
        kind: 'function',
        detail: 'Custom file upload handler',
        insertText: 'public function custom_fileupload($request)\n{\n\tif(!$request->hasFile("file")){return response()->json("file harus ada",400);}\n\t$response = uploadfile($this,$request);\n\treturn response()->json(is_array($response)?implode("\\n",$response):$response,is_array($response)?400:200);\n}',
    },
    {
        label: 'custom_importexcel',
        kind: 'function',
        detail: 'Custom excel import handler',
        insertText: 'public function custom_importexcel($request)\n{\n\tif(!$request->hasFile("file")){return response()->json("file harus ada",400);}\n\treturn _uploadexcel($this, $request);\n}',
    },
    {
        label: 'deleteAfter',
        kind: 'function',
        detail: 'Called after model deletion',
        insertText: 'public function deleteAfter($model, $arrayData, $metaData, $id=null)\n{\n\t\n}',
    },
    {
        label: 'deleteBefore',
        kind: 'function',
        detail: 'Called before model deletion',
        insertText: 'public function deleteBefore($model, $arrayData, $metaData, $id=null)\n{\n\treturn [\n\t\t"model" => $model\n\t];\n}',
    },
    {
        label: 'deleteRoleCheck',
        kind: 'function',
        detail: 'Check role permissions for deletion',
        insertText: 'public function deleteRoleCheck($id)\n{\n\t// config([ \'reason\' => \'Akses ditolak!\' ]);\n\treturn true;\n}',
    },
    {
        label: 'extendJoin',
        kind: 'function',
        detail: 'Extend query with additional joins',
        insertText: 'public function extendJoin($model)\n{\n\t$runtimeQuery = "SELECT * FROM other_tables";\n\t$model = $model->leftJoinSub($runtimeQuery, \'runtime_sql\', function ($join) {\n\t\t$join->on("{$this->getTable()}.id", \'=\', \'runtime_sql.id\');\n\t});\n\t\n\treturn $model;\n}',
    },
    {
        label: 'listRoleCheck',
        kind: 'function',
        detail: 'Check role permissions for listing',
        insertText: 'public function listRoleCheck()\n{\n\t// config([ \'reason\' => \'Akses ditolak!\' ]);\n\treturn true;\n}',
    },
    {
        label: 'queryCache',
        kind: 'function',
        detail: 'Configure query caching',
        insertText: 'public function queryCache(object $param)\n{\n\treturn [\n\t\t\'key\' => "new-key",\n\t\t\'time\' => 60*60*24 // seconds\n\t];\n}',
    },
    {
        label: 'queryCacheById',
        kind: 'function',
        detail: 'Configure query caching by ID',
        insertText: 'public function queryCacheById(object $param)\n{\n\treturn [\n\t\t\'key\' => "new-key",\n\t\t\'time\' => 60*60*24 // seconds\n\t];\n}',
    },
    {
        label: 'readRoleCheck',
        kind: 'function',
        detail: 'Check role permissions for reading',
        insertText: 'public function readRoleCheck($id)\n{\n\t// config([ \'reason\' => \'Akses ditolak!\' ]);\n\treturn true;\n}',
    },
    {
        label: 'transformArrayData',
        kind: 'function',
        detail: 'Transform array data',
        insertText: 'public function transformArrayData(array $arrayData)\n{\n\tforeach($arrayData as $idx => $singleData){\n\t\t$arrayData[$idx][\'newColumn\'] = \'nice day!\';\n\t}\n\treturn $arrayData;\n}',
    },
    {
        label: 'transformRowData',
        kind: 'function',
        detail: 'Transform single row data',
        insertText: 'public function transformRowData(array $row)\n{\n\treturn array_merge($row, []);\n}',
    },
    {
        label: 'updateAfter',
        kind: 'function',
        detail: 'Called after model update',
        insertText: 'public function updateAfter($model, $arrayData, $metaData, $id=null)\n{\n\t//  code here\n}',
    },
    {
        label: 'updateAfterTransaction',
        kind: 'function',
        detail: 'Called after update transaction',
        insertText: 'public function updateAfterTransaction($newdata, $olddata, $data, $meta)\n{\n\t\n}',
    },
    {
        label: 'updateBefore',
        kind: 'function',
        detail: 'Called before model update',
        insertText: 'public function updateBefore($model, $arrayData, $metaData, $id=null)\n{\n\t$newArrayData = array_merge($arrayData,[]);\n\treturn [\n\t\t"model" => $model,\n\t\t"data" => $newArrayData,\n\t\t// "errors" => [\'error1\']\n\t];\n}',
    },
    {
        label: 'updateRoleCheck',
        kind: 'function',
        detail: 'Check role permissions for update',
        insertText: 'public function updateRoleCheck($id)\n{\n\t// config([ \'reason\' => \'Akses ditolak!\' ]);\n\treturn true;\n}',
    },
    {
        label: 'validationCreate',
        kind: 'property',
        detail: 'Validation rules for creation',
        insertText: 'validationCreate = [\n\t$0\n];',
    },
    {
        label: 'queryCache',
        kind: 'function',
        detail: 'Query cache configuration',
        insertText: 'function queryCache() {\n\t$0\n}',
    },
    {
        label: 'queryCacheById',
        kind: 'function',
        detail: 'Query cache by ID',
        insertText: 'function queryCacheById() {\n\t$0\n}',
    }
];

export const modelPropertyCompletions = [
    {
        label: '$table',
        kind: 'property',
        detail: 'The table associated with the model',
        insertText: 'protected $table = "${1:table_name}";',
        documentation: 'Specifies the database table for this model'
    },
    {
        label: '$primaryKey',
        kind: 'property',
        detail: 'The primary key for the model',
        insertText: 'protected $primaryKey = "${1:id}";',
        documentation: 'Specifies the primary key column'
    },
    {
        label: '$fillable',
        kind: 'property',
        detail: 'The fillable attributes for the model',
        insertText: 'protected $fillable = [\n\t${0}\n];',
        documentation: 'Array of attributes that are mass assignable'
    }
];
