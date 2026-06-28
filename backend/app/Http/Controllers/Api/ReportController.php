<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    use ApiResponse;

    public function profitLoss(): JsonResponse
    {
        $totalRevenue = (float) Invoice::sum('total');

        $totalCogs = (float) InvoiceItem::join('products', 'invoice_items.product_id', '=', 'products.id')
            ->selectRaw('SUM(invoice_items.qty * products.cost_price) as cogs')
            ->value('cogs') ?? 0;

        $grossProfit = $totalRevenue - $totalCogs;
        $totalExpenses = (float) Expense::sum('amount');
        $netProfit = $grossProfit - $totalExpenses;

        $grossMarginPct = $totalRevenue > 0 ? round(($grossProfit / $totalRevenue) * 100, 2) : 0;
        $netMarginPct = $totalRevenue > 0 ? round(($netProfit / $totalRevenue) * 100, 2) : 0;
        $expenseRatioPct = $totalRevenue > 0 ? round(($totalExpenses / $totalRevenue) * 100, 2) : 0;
        $cogsRatioPct = $totalRevenue > 0 ? round(($totalCogs / $totalRevenue) * 100, 2) : 0;

        $expenseBreakdown = Expense::selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        return $this->success([
            'total_revenue' => $totalRevenue,
            'total_cogs' => $totalCogs,
            'gross_profit' => $grossProfit,
            'total_expenses' => $totalExpenses,
            'net_profit' => $netProfit,
            'gross_margin_pct' => $grossMarginPct,
            'net_margin_pct' => $netMarginPct,
            'expense_ratio_pct' => $expenseRatioPct,
            'cogs_ratio_pct' => $cogsRatioPct,
            'expense_breakdown' => $expenseBreakdown,
            'weekly_avg' => [
                'revenue' => round($totalRevenue / 4, 2),
                'cogs' => round($totalCogs / 4, 2),
                'gross_profit' => round($grossProfit / 4, 2),
                'expenses' => round($totalExpenses / 4, 2),
                'net_profit' => round($netProfit / 4, 2),
            ],
        ]);
    }

    public function monthlySales(): JsonResponse
    {
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $months->push(now()->subMonths($i));
        }

        $sales = Invoice::selectRaw('YEAR(date) as year, MONTH(date) as month, SUM(total) as total')
            ->where('date', '>=', now()->subMonths(5)->startOfMonth())
            ->groupBy('year', 'month')
            ->get()
            ->keyBy(fn ($row) => $row->year . '-' . str_pad((string) $row->month, 2, '0', STR_PAD_LEFT));

        $result = $months->map(function ($date) use ($sales) {
            $key = $date->format('Y-m');
            $row = $sales->get($key);

            return [
                'month' => $date->format('M'),
                'total' => $row ? (float) $row->total : 0,
            ];
        })->values();

        return $this->success($result);
    }
}
