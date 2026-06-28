<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name' => 'Lawn Fabric 3m', 'category' => 'Lawn', 'price' => 850, 'cost_price' => 550, 'stock_qty' => 45, 'unit' => 'meters', 'reorder_level' => 10],
            ['name' => 'Khaddar Suit Piece', 'category' => 'Khaddar', 'price' => 1200, 'cost_price' => 750, 'stock_qty' => 28, 'unit' => 'pcs', 'reorder_level' => 8],
            ['name' => 'Chiffon Dupatta', 'category' => 'Chiffon', 'price' => 650, 'cost_price' => 380, 'stock_qty' => 62, 'unit' => 'pcs', 'reorder_level' => 15],
            ['name' => 'Cotton Shirting 5m', 'category' => 'Cotton', 'price' => 1100, 'cost_price' => 680, 'stock_qty' => 7, 'unit' => 'meters', 'reorder_level' => 10],
            ['name' => 'Silk Fabric 2m', 'category' => 'Silk', 'price' => 2200, 'cost_price' => 1500, 'stock_qty' => 18, 'unit' => 'meters', 'reorder_level' => 5],
            ['name' => 'Embroidered Panel', 'category' => 'Embroidery', 'price' => 3500, 'cost_price' => 2200, 'stock_qty' => 12, 'unit' => 'pcs', 'reorder_level' => 4],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        $customers = [
            ['name' => 'Ayesha Khan', 'phone' => '0300-1234567', 'type' => 'retail', 'balance' => 0, 'total_purchase' => 0],
            ['name' => 'Fatima Traders', 'phone' => '0321-9876543', 'type' => 'wholesale', 'balance' => 8500, 'total_purchase' => 0],
            ['name' => 'Zubaida Begum', 'phone' => '0333-5557890', 'type' => 'retail', 'balance' => 2200, 'total_purchase' => 0],
            ['name' => 'Style Point Shop', 'phone' => '0312-4443321', 'type' => 'wholesale', 'balance' => 15000, 'total_purchase' => 0],
            ['name' => 'Nazia Textile', 'phone' => '0345-1119988', 'type' => 'wholesale', 'balance' => 0, 'total_purchase' => 0],
        ];

        foreach ($customers as $customer) {
            Customer::create($customer);
        }

        $vendors = [
            ['name' => 'Al-Rehman Cloth House', 'phone' => '042-3456789', 'city' => 'Lahore', 'balance' => 22000, 'total_purchase' => 0],
            ['name' => 'Chenab Fabrics', 'phone' => '041-7788990', 'city' => 'Faisalabad', 'balance' => 0, 'total_purchase' => 0],
            ['name' => 'Karachi Silk Mills', 'phone' => '021-3344556', 'city' => 'Karachi', 'balance' => 45000, 'total_purchase' => 0],
            ['name' => 'Punjab Weaving Co', 'phone' => '042-9988776', 'city' => 'Lahore', 'balance' => 8500, 'total_purchase' => 0],
        ];

        foreach ($vendors as $vendor) {
            Vendor::create($vendor);
        }
    }
}
