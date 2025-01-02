const Order = require("../models/Order.js"); 
const OrderDetails = require("../models/OrderDetails.js");
const Shirts = require('../models/Shirt.js');

// Function to get total orders and growth rate
const getTotalOrdersStats = async (req, res) => {
    try {
        const currentDate = new Date();
        const lastWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Get total orders with payment completed and status confirmed
        const totalOrders = await Order.countDocuments({
            'paymentDetails.status': 'completed',
            orderStatus: 'confirmed'
        });

        // Get orders from last week
        const lastWeekOrders = await Order.countDocuments({
            createdAt: { $gte: lastWeek, $lte: currentDate },
            'paymentDetails.status': 'completed',
            orderStatus: 'confirmed'
        });

        // Get orders from previous week for comparison
        const previousWeekOrders = await Order.countDocuments({
            createdAt: {
                $gte: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
                $lte: lastWeek
            },
            'paymentDetails.status': 'completed',
            orderStatus: 'confirmed'
        });

        // Calculate weekly growth
        const weeklyGrowth = previousWeekOrders === 0 ? 100 :
            ((lastWeekOrders - previousWeekOrders) / previousWeekOrders * 100).toFixed(2);

        return res.status(200).json({
            totalOrders,
            weeklyGrowth: `${weeklyGrowth > 0 ? '+' : ''}${weeklyGrowth}% this week`
        });
    } catch (error) {
        throw new Error('Error fetching total orders stats: ' + error.message);
    }
};

const getTopProducts = async (req,res ) => {
    try {
        const limit = 4 ;
        // Get all order details with product information
        const orderDetails = await OrderDetails.find({ itemType: 'store' })
            .populate('product');

        // Calculate total sales for each product
        const productSales = {};
        orderDetails.forEach(detail => {
            if (detail.product) {
                const productId = detail.product._id.toString();
                if (!productSales[productId]) {
                    productSales[productId] = {
                        product: detail.product,
                        quantity: 0
                    };
                }
                productSales[productId].quantity += detail.productQuantity;
            }
        });

        // Calculate total quantity sold
        const totalQuantitySold = Object.values(productSales)
            .reduce((sum, item) => sum + item.quantity, 0);

        // Convert to array and sort by quantity
        const sortedProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, limit)
            .map((item, index) => {
                const salesPercentage = ((item.quantity / totalQuantitySold) * 100).toFixed(2);
                return {
                    id: item.product._id,
                    name: item.product.name,
                    popularity: parseInt(salesPercentage),
                    sales: `${salesPercentage}%`
                };
            });

        return res.status(200).json( sortedProducts);
    } catch (error) {
        throw new Error('Error fetching top products: ' + error.message);
    }
}; 

const getRevenueData = async (req, res) => {
   
    try {
        const { year } = req.query;
        const selectedYear = parseInt(year) || new Date().getFullYear();
        
        const monthlyData = [];
        for (let month = 0; month < 12; month++) {
            // Create dates in UTC
            const startDate = new Date(Date.UTC(selectedYear, month, 1));
            console.log("startDate: ", startDate);
            const endDate = new Date(Date.UTC(selectedYear, month + 1, 0, 23, 59, 59, 999));
            console.log("startDate: ", startDate);

            const monthlyOrders = await Order.find({
                createdAt: { $gte: startDate, $lte: endDate },
                'paymentDetails.status': 'completed',
                orderStatus: 'confirmed',
            });
            
            const monthlyRevenue = monthlyOrders.reduce(
                (sum, order) => sum + order.total + order.shippingFee,
                0
            );
            
            monthlyData.push({
                month: new Date(selectedYear, month).toLocaleString('default', { month: 'short' }),
                revenue: monthlyRevenue
            });
        }

        const currentMonth = new Date().getMonth();
        const currentMonthRevenue = monthlyData[currentMonth].revenue;
        const lastMonthRevenue = monthlyData[currentMonth - 1]?.revenue || 0;
        const profitGrowth = lastMonthRevenue === 0 ? 100 :
            ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(2);

        return res.status(200).json({
            monthlyData,
            earnings: {
                total: currentMonthRevenue,
                growth: profitGrowth
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching revenue data: ' + error.message });
    }
};

const getLeastQuantityProducts = async (req,res) => {
    try {
        // Get products sorted by quantity in ascending order
        const limit = 4;
        const products = await Shirts.find()
            .sort({ quantity: 1 })
            .limit(limit)
            .select('name quantity');
            const data =  products.map((product, index) => ({
                // id: String(index + 1).padStart(2, '0'),
                id: product._id,
                name: product.name,
                quantity: product.quantity
            }));

        return  res.status(200).json(data);
    } catch (error) {
        throw new Error('Error fetching least quantity products: ' + error.message);
    }
};

const getDailyRevenue = async (req, res) => {
    try {
        const { date } = req.query;
        const selectedDate = new Date(date);

        // Đặt thời gian bắt đầu và kết thúc trong ngày được chọn
        const startDate = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endDate = new Date(selectedDate.setHours(23, 59, 59, 999));

        // Lấy danh sách đơn hàng trong ngày được chọn
        const dailyOrders = await Order.find({
            createdAt: { $gte: startDate, $lte: endDate },
            'paymentDetails.status': 'completed',
            orderStatus: 'confirmed',
        });

        // Tính tổng doanh thu
        const dailyRevenue = dailyOrders.reduce(
            (sum, order) => sum + order.total + order.shippingFee,
            0
        );
        console.log("dailyrevenue",dailyRevenue )

        return res.status(200).json({
            revenue: dailyRevenue,
            orderCount: dailyOrders.length,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching daily revenue: ' + error.message });
    }
};


module.exports = {
    getTotalOrdersStats,
    getLeastQuantityProducts,
    getTopProducts,
    getRevenueData,
    getDailyRevenue,
};