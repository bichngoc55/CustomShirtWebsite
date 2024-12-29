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
                    id: String(index + 1).padStart(2, '0'),
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
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Get revenue data for the last 12 months
        const revenueData = [];
        for (let i = 0; i < 12; i++) {
            const month = new Date(currentYear, currentMonth - i, 1);
            const nextMonth = new Date(currentYear, currentMonth - i + 1, 1);

            const monthlyOrders = await Order.find({
                createdAt: { $gte: month, $lt: nextMonth },
                'paymentDetails.status': 'completed',
                orderStatus: 'confirmed',
            });

            const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total + order.shippingFee, 0);
            revenueData.unshift({
                month: month.toLocaleString('default', { month: 'short' }),
                revenue: monthlyRevenue
            });
        }

        // Calculate current month revenue and growth
        const currentMonthRevenue = revenueData[11].revenue;
        const lastMonthRevenue = revenueData[10].revenue;
        const profitGrowth = lastMonthRevenue === 0 ? 100 :
            ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(2);

        return res.status(200).json({
            monthlyData: revenueData,
            earnings: {
                total: currentMonthRevenue,
                growth: profitGrowth
            }
        });
    } catch (error) {
        throw new Error('Error fetching revenue data: ' + error.message);
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
                id: String(index + 1).padStart(2, '0'),
                name: product.name,
                quantity: product.quantity
            }));

        return  res.status(200).json(data);
    } catch (error) {
        throw new Error('Error fetching least quantity products: ' + error.message);
    }
};

module.exports = {
    getTotalOrdersStats,
    getLeastQuantityProducts,
    getTopProducts,
    getRevenueData
};