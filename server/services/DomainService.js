const { Sequelize, QueryTypes } = require('sequelize');

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

function insertDomain(value) {
    const [result, meta] = sequelize.query(
        'INSERT INTO domains (domain) VALUES (?)',
        {
            replacements: [value]
        }
    )
    console.log('Insert domain result', result, meta)
    if (domain.length > 0) {
        console.log(domain)
        return true
    }
    return false
}

module.exports = {
    checkDomain,
    insertDomain
}