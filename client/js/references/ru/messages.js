define(function() {
var module = {exports: {}};
/**
 * Справочник клиентских сообщений
 *
    id - идентификатор
    key - ключ 
    value - значение
 */
var Reference = {};

/**
 * Вернет данные сообщение по id
 */
Reference.getByKey = function(key) {
	for(var i = 0; i < this.data.length; i++) {
		if (this.data[i].key == key) {
			return this.data[i].value;
		}
	}
}

// послдение строчки обрабатываются grunt'ом, не менять!

Reference.data = [{"id":1,"key":"energy","value":"Энергия"},{"id":2,"key":"rating","value":"Рейтинг"},{"id":3,"key":"all_fights","value":"Всего боев"},{"id":4,"key":"wins","value":"Побед"},{"id":5,"key":"loses","value":"Поражений"},{"id":6,"key":"fights_btn","value":"В бой"},{"id":7,"key":"rating_btn","value":"Рейтинг"},{"id":8,"key":"tournament_btn","value":"Турнир"},{"id":9,"key":"window_title_search","value":"Поиск противника"},{"id":10,"key":"main_title","value":"Словесное Кунг-Фу"},{"id":11,"key":"dictionary_loading_hint","value":"Загрузка словаря.."},{"id":12,"key":"msg_not_active_battle","value":"Бой не активен"},{"id":13,"key":"msg_battle_not_found","value":"Бой не найден"},{"id":14,"key":"msg_invalid_params","value":"Неверные параметры"},{"id":15,"key":"msg_word_not_found","value":"Такого слова нет в словаре"},{"id":16,"key":"window_title_battle_resul_win","value":"Победа!"},{"id":17,"key":"window_title_battle_resul_lose","value":"Поражение.."},{"id":18,"key":"league","value":"Лига"},{"id":19,"key":"new_league_congrats","value":"Поздравляем с новой лигой"},{"id":20,"key":"place_no","value":"..."},{"id":21,"key":"place_top_10","value":"топ 10%"},{"id":22,"key":"place_top_30","value":"топ 30%"},{"id":23,"key":"place_top_50","value":"топ 50%"},{"id":24,"key":"place_under_50","value":"ниже 50%"},{"id":25,"key":"place_title","value":"место"},{"id":26,"key":"group_btn","value":"Группа игры"},{"id":27,"key":"word-clear-tip","value":"Стереть"},{"id":28,"key":"word-hint","value":"составьте слово"},{"id":29,"key":"window_title_energy","value":"Восстановить энергию"},{"id":30,"key":"add-energy-btn-tip","value":"Восстановить энергию"},{"id":31,"key":"low_energy_hint","value":"Не хватает энергии"},{"id":32,"key":"money_name","value":"голосов"},{"id":33,"key":"free-energy-btn-text","value":"Бесплатно"},{"id":34,"key":"money-energy-btn-hint","value":"Безлимит навечно!"},{"id":35,"key":"free-energy-btn-hint","value":"Безлимит на 2 часа"},{"id":36,"key":"msg_file_not_found","value":"Файл не найден"},{"id":37,"key":"vk_wallpost_message","value":"Новая игра \"Словесное Кунг-Фу\"! На что способен ты? http://vk.com/app5326976_349201736"},{"id":38,"key":"infinity_energy","value":"безлимит"},{"id":39,"key":"window_title_rating","value":"Рейтинг"},{"id":40,"key":"rating_header_place","value":"Место"},{"id":41,"key":"rating_header_title","value":"Имя"},{"id":42,"key":"rating_header_league","value":"Лига"},{"id":43,"key":"rating_header_points","value":"Очки"}];
module.exports = Reference;
return module.exports; });