// here we will build a class that contains all of the api Features
// this classs will take the query and mongooose query as parameters

import { paginationFunction } from "./pagination.js"


export class ApiFeatures {
    constructor(query, mongooseQuery){
        this.query = query
        this.mongooseQuery = mongooseQuery
    }

    // 1- pagination 
    pagination({page, size}){
        let {limit, skip } = paginationFunction({page, size})

        this.mongooseQuery = this.mongooseQuery.limit(limit).skip(skip)
        return this
    }

    //2-sort
    sort(sortBy) {
        if (!sortBy) {
            this.mongooseQuery = this.mongooseQuery.sort({ createdAt: -1 })
            return this
        }
        const formula = sortBy.replace(/desc/g, -1).replace(/asc/g, 1).replace(/ /g, ':') // 'stock  desc' => 'stock: -1'
        const [key, value] = formula.split(':')

        this.mongooseQuery = this.mongooseQuery.sort({ [key]: +value })
        return this
    }
    //3- search
    search(search) {
        const queryFilter = {}
        
        if (search.name) queryFilter.name = { $regex: search.name, $options: 'i' }
        if (search.title) queryFilter.title = { $regex: search.title, $options: 'i' }
        if (search.description) queryFilter.desc = { $regex: search.desc, $options: 'i' }
        if (search.discount) queryFilter.discount = { $ne: 0 }
        if (search.priceFrom && !search.priceTo) queryFilter.appliedPrice = { $gte: search.priceFrom }
        if (search.priceTo && !search.priceFrom) queryFilter.appliedPrice = { $lte: search.priceTo }
        if (search.priceTo && search.priceFrom) queryFilter.appliedPrice = { $gte: search.priceFrom, $lte: search.priceTo }

        this.mongooseQuery = this.mongooseQuery.find(queryFilter)
        return this
    }

}
