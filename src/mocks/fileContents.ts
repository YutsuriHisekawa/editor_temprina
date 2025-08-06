const modelTemplate = (name: string) => `<?php
namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;

class ${name} extends Model
{
    protected $table = 'table_name';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'column1',
        'column2',
        'column3'
    ];
    
    // Relationships
    public function relatedModel()
    {
        return $this->hasMany(RelatedModel::class);
    }
}`;

const bladeTemplate = (name: string) => `@extends('layouts.app')

@section('content')
<div class="container">
    <h1>${name}</h1>
    <div class="card">
        <div class="card-body">
            @foreach($items as $item)
                <div class="item">
                    {{ $item->name }}
                </div>
            @endforeach
        </div>
    </div>
</div>
@endsection`;

const javascriptTemplate = (name: string) => `// ${name}
$(document).ready(function() {
    const app = {
        init: function() {
            this.bindEvents();
            this.setupDataTable();
        },

        bindEvents: function() {
            $('#saveBtn').on('click', this.handleSave);
            $('#searchInput').on('keyup', this.handleSearch);
        },

        setupDataTable: function() {
            $('#dataTable').DataTable({
                processing: true,
                serverSide: true,
                ajax: '/api/data'
            });
        },

        handleSave: function(e) {
            e.preventDefault();
            // Save logic here
        }
    };

    app.init();
});`;

const coreTemplate = (name: string) => `<?php
namespace App\\Core;

class ${name}
{
    public function __construct()
    {
        // Constructor logic
    }

    public function initialize()
    {
        // Initialization code
    }

    public function process()
    {
        // Core processing logic
    }
}`;

export const getMockContent = (fileId: string): string => {
    const [type, name] = fileId.split('-');

    switch (type) {
        case 'model':
            return modelTemplate(name);
        case 'blade':
            return bladeTemplate(name);
        case 'js':
            return javascriptTemplate(name);
        case 'core':
            return coreTemplate(name);
        default:
            return '// Empty file';
    }
};
