<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    public function index()
    {
        return Cache::remember('products.all', 300, function () {
            return Product::all();
        });
    }

    public function show($id)
    {
        return Cache::remember("product.{$id}", 300, function () use ($id) {
            return Product::findOrFail($id);
        });
    }
}
