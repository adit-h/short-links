const { Sequelize, QueryTypes } = require('sequelize');
//const DomainModel = require('../models/Domain');

const Hashids = require('hashids/cjs')
const salt = process.env.SALT

const config = {
    host: process.env.FE_DB_HOST,
    database: process.env.FE_DB_NAME,
    username: process.env.FE_DB_USER,
    password: process.env.FE_DB_PASS,
    port: process.env.FE_DB_PORT,
}

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    port: config.port
})


/**
 * Check existing URL data by value
 * @param {string} value url
 * @returns {bolean}
 */
async function checkUrl(value) {
    const hash_url = await sequelize.query(
        'SELECT * FROM hash_urls WHERE url = ?',
        {
            replacements: [value],
            type: QueryTypes.SELECT
        }
    )
    console.log(hash_url.length)
    if (hash_url.length > 0) {
        console.log(hash_url)
        return true
    }
    return false
}

/**
 * Check existing Domain data by value
 * @param {string} value domain
 * @returns {bolean}
 */
async function checkDomain(value) {
    const domain = await sequelize.query(
        'SELECT * FROM domains WHERE domain = ?',
        {
            replacements: [value],
            type: QueryTypes.SELECT
        }
    )
    console.log(domain.length)
    if (domain.length > 0) {
        console.log(domain)
        return true
    }
    return false
}

/**
 * Get URL data by value
 * @param {string} value url
 * @returns {array}
 */
async function getUrl(value) {
    const hash_url = await sequelize.query(
        'SELECT * FROM hash_urls WHERE url = ?',
        {
            replacements: [value],
            type: QueryTypes.SELECT
        }
    )
    console.log(hash_url.length)
    if (hash_url.length > 0) {
        return hash_url[0]
    }
    return false
}

async function getUrlbyId(value) {
    const hash_url = await sequelize.query(
        'SELECT * FROM hash_urls WHERE id = ?',
        {
            replacements: [value],
            type: QueryTypes.SELECT
        }
    )
    console.log(hash_url.length)
    if (hash_url.length > 0) {
        return hash_url[0]
    }
    return false
}

async function getUrlbyHash(value) {
    const hash_url = await sequelize.query(
        'SELECT * FROM hash_urls WHERE hash = BINARY ?',
        {
            replacements: [value],
            type: QueryTypes.SELECT
        }
    )
    console.log(hash_url.length)
    if (hash_url.length > 0) {
        return hash_url[0]
    }
    return false
}

/**
 * Insert new Url data and we generate hashid from successfully inserterd id
 * @param {string} value URL
 * @returns 
 */
async function insertUrl(did, url) {
    try {
        const [result_ins, meta_ins] = await sequelize.query(
            "INSERT INTO hash_urls (domainId, url, expiry, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
            {
                replacements: [did, url, null, new Date(), new Date()]
            }
        );
        console.log('Insert url result', result_ins, meta_ins)

        let hash_val = new Hashids(salt, 7)  // pad to length 7
        //console.log(hash_val)
        let me = hash_val.encode(result_ins)
        console.log(me)

        // after success insert, lets generate hashid from new id
        const [result_up, meta_up] = await sequelize.query(
            "UPDATE hash_urls SET hash = ? WHERE id = ?",
            {
                replacements: [me, result_ins]
            }
        );
        console.log('Update hash_urls result', result_up, meta_up)

        return result_ins
    } catch (e) {
        console.log(e)
        return false
    }
}

/**
 * Insert new Url data by checking first
 * @param {array} of URLs
 * @returns 
 */
async function insertMultiUrl(datas) {
    try {
        console.log('inside insert Multi URL')
        console.log(datas)

        //datas.forEach(function(data){
            // cek for existing URL first
            const cekUrl = await sequelize.query(
                'SELECT * FROM hash_urls WHERE url = ?',
                {
                    replacements: [datas.link],
                    type: QueryTypes.SELECT
                }
            )
            console.log(cekUrl.length)
            if (cekUrl.length > 0) {
                console.log('url exist. skip')
            } else {
                console.log('insert new url')
                const [result, meta] = await sequelize.query(
                    "INSERT INTO hash_urls (domainId, hash, url, expiry, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
                    {
                        replacements: [datas.did, datas.hash, datas.link, null, new Date(), new Date()]
                    }
                );
                console.log('Insert multi url result', result, meta)
            }
        //})
    } catch (e) {
        console.log(e)
    }
}

/**
 * Insert new Domain data
 * @param {string} value domain
 * @returns 
 */
async function insertDomain(value) {
    try {
        const [result, meta] = await sequelize.query(
            "INSERT INTO domains (domain, createdAt, updatedAt) VALUES (?, ?, ?)",
            {
                replacements: [value, new Date(), new Date()]
            }
        );
        console.log('Insert domains result', result, meta)
    } catch (e) {
        console.log(e)
    }
}

async function getDomain(name) {
    try {
        const domain = await sequelize.query(
            'SELECT * FROM domains WHERE domain = ?',
            {
                replacements: [name],
                type: QueryTypes.SELECT
            }
        )
        console.log(domain.length)
        if (domain.length > 0) {
            //console.log(domain)
            // return the 1st array result
            return domain[0]
        }
        return false
    } catch (e) {
        console.log(e)
    }
}

async function convert(msg, domain, arlinks) {
    try {
        let newlink = ''
        console.log('welcome to convert function')
        //console.log(msg, arlinks)
        const protocol = ''     // value = https://
    
        await Promise.all(arlinks.map(async (data) => {
            // console.log(data)
            let resCheck = await getUrl(data)
            if (!resCheck) {
                // insert New URL
                let domainData = await getDomain(domain)
                console.log(domainData)
                let resNew = await insertUrl(domainData.id, data)
                console.log(resNew)
                resCheck = await getUrlbyId(resNew)

                // use current url
                newlink = protocol + domain +'/'+ resCheck.hash
                console.log('new URL', newlink)
            } else {
                console.log(resCheck)
                // use current url
                newlink = protocol + domain +'/'+ resCheck.hash
                console.log('existing URL', newlink)    
            }
            msg = msg.replace(resCheck.url, newlink)
        }))
    
        console.log('complete all') // gets loged first
        return msg    
    } catch (e) {
        console.log(e)
    }
}
/*
async function insertDomainWithModel(value) {
    try {
        const res = await DomainModel.create({ domain: value })
        console.log(res instanceof DomainModel)
        console.log(res.domain)
        await res.save()
        console.log('New Domain saved to the database!');    
    } catch (e) {
        console.log(e)
    }
}*/

module.exports = {
    checkUrl,
    insertUrl,
    getUrl,
    getUrlbyId,
    getUrlbyHash,
    checkDomain,
    insertDomain,
    getDomain,
    convert
}