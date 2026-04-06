import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import Rating from "../models/rating.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
    try {
        const { name, category, foodType, price } = req.body
        if (!name || !price || !category || !foodType) {
            return res.status(400).json({ message: "All Fields are required." })

        }

        let image;
        if (req.file) {
            const fileSizeInMB = req.file.size / (1024 * 1024);

            if (fileSizeInMB > 2) { 
                return res.status(400).json({message: "Image size should be less than 2MB"});
            }
            image = await uploadOnCloudinary(req.file.path)

        }
        const shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            return res.status(400).json({ message: "shop not found" })
        }
        const item = await Item.create({
            name, category, foodType, price, image, shop: shop._id
        })

        shop.items.push(item._id)
        await shop.save()
        await shop.populate("owner")
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(201).json(shop)

    } catch (error) {
        return res.status(500).json({ message: `add item error ${error}` })
    }
}

export const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const { name, category, foodType, price } = req.body
        if (!name || !price || !category || !foodType) {
            return res.status(400).json({ message: "All Fields are required." })

        }
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }
        const item = await Item.findByIdAndUpdate(itemId, {
            name, category, foodType, price, image
        }, { new: true })
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }
        const shop = await Shop.findOne({ owner: req.userId }).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(200).json(shop)

    } catch (error) {
        return res.status(500).json({ message: `edit item error ${error}` })
    }
}

export const getItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findById(itemId)
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }
        return res.status(200).json(item)
    } catch (error) {
        return res.status(500).json({ message: `get item error ${error}` })
    }
}

export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findByIdAndDelete(itemId)
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }
        const shop = await Shop.findOne({ owner: req.userId })
        shop.items = shop.items.filter(i => i !== item._id)
        await shop.save()
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(200).json(shop)

    } catch (error) {
        return res.status(500).json({ message: `delete item error ${error}` })
    }
}

export const getItemByCity = async (req, res) => {
    try {
        const { city } = req.params
        if (!city) {
            return res.status(400).json({ message: "city is required" })
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate('items')
        if (!shops) {
            return res.status(400).json({ message: "shops not found" })
        }
        const shopIds = shops.map((shop) => shop._id)

        const items = await Item.find({ shop: { $in: shopIds } })
        return res.status(200).json(items)

    } catch (error) {
        return res.status(500).json({ message: `get item by city error ${error}` })
    }
}

export const getItemsByShop = async (req, res) => {
    try {
        const { shopId } = req.params
        const shop = await Shop.findById(shopId).populate("items")
        if (!shop) {
            return res.status(400).json("shop not found")
        }
        return res.status(200).json({
            shop, items: shop.items
        })
    } catch (error) {
        return res.status(500).json({ message: `get item by shop error ${error}` })
    }
}

export const searchItems = async (req, res) => {
    try {
        const { query, city } = req.query
        if (!query || !city) {
            return null
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate('items')
        if (!shops) {
            return res.status(400).json({ message: "shops not found" })
        }
        const shopIds = shops.map(s => s._id)
        const items = await Item.find({
            shop: { $in: shopIds },
            $or: [
                { name: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ]

        }).populate("shop", "name image")

        return res.status(200).json(items)

    } catch (error) {
        return res.status(500).json({ message: `search item  error ${error}` })
    }
}


export const rating = async (req, res) => {
    try {
        const { itemId, rating } = req.body

        if (!itemId || !rating) {
            return res.status(400).json({ message: "itemId and rating is required" })
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "rating must be between 1 to 5" })
        }

        const item = await Item.findById(itemId)
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }


        const existing = await Rating.findOne({
            user: req.userId,
            item: itemId
        })

        if (existing) {
            existing.rating = rating
            await existing.save()
        } else {
            await Rating.create({
                user: req.userId,
                item: itemId,
                rating
            })
        }


        const allRatings = await Rating.find({ item: itemId })

        const total = allRatings.reduce((sum, r) => sum + r.rating, 0)
        const avg = total / allRatings.length

        item.rating.count = allRatings.length
        item.rating.average = avg

        await item.save()

        return res.status(200).json({ rating: item.rating })

    } catch (error) {
        console.log("RATING ERROR:", error);
        return res.status(500).json({ message: `rating error ${error}` })
    }
}